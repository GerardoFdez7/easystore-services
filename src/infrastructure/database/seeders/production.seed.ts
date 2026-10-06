import fs from 'fs';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from '../../../config/logger';
import {
  Id,
  FeatureEnum,
} from '../../../domains/shared/aggregates/value-objects';
import { PostgreService } from '../postgres.service';

const logger = new CustomLoggerService();
const dataDir = path.join(__dirname, '..', 'countries');

interface StateData {
  name: string;
  code: string;
}

interface CountryFileData {
  country: {
    name: string;
    code: string;
  };
  states: StateData[];
}

interface FeatureCatalogEntry {
  code: FeatureEnum;
  name: string;
  description: string;
}

/**
 * The global feature catalog every tenant's roles are built from. Seeded once as
 * reference data, keyed by the unique `code` column.
 */
const featureCatalog: FeatureCatalogEntry[] = [
  {
    code: FeatureEnum.CATALOG,
    name: 'Catalog',
    description: 'Manage products and categories',
  },
  {
    code: FeatureEnum.INVENTORY,
    name: 'Inventory',
    description: 'Manage warehouses and stock levels',
  },
  {
    code: FeatureEnum.ORDERS,
    name: 'Orders',
    description: 'Manage carts, orders, and fulfillment',
  },
  {
    code: FeatureEnum.CUSTOMERS,
    name: 'Customers',
    description: 'Manage customer records and reviews',
  },
  {
    code: FeatureEnum.ANALYTICS,
    name: 'Reports',
    description: 'View analytics and reporting dashboards',
  },
  {
    code: FeatureEnum.SETTINGS,
    name: 'Settings',
    description: 'Manage store settings and addresses',
  },
];

function readCountryFiles(): CountryFileData[] {
  return fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith('.json'))
    .map(
      (file) =>
        JSON.parse(
          fs.readFileSync(path.join(dataDir, file), 'utf-8'),
        ) as CountryFileData,
    );
}

async function seedFeatureCatalog(prisma: PostgreService): Promise<void> {
  for (const feature of featureCatalog) {
    const existingFeature = await prisma.feature.findUnique({
      where: { code: feature.code },
    });
    const featureId = existingFeature?.id ?? Id.generate().getValue();

    await prisma.feature.upsert({
      where: { id: featureId },
      update: {
        code: feature.code,
        name: feature.name,
        description: feature.description,
      },
      create: {
        id: featureId,
        code: feature.code,
        name: feature.name,
        description: feature.description,
      },
    });
  }
}

/**
 * Refuses to start the application if a `FeatureEnum` member has no seeded
 * `Feature` row — a missing row would silently deny every operation referencing it.
 */
export async function assertFeatureCatalogSeeded(
  prisma: PostgreService,
): Promise<void> {
  const rows = await prisma.feature.findMany({
    where: { code: { in: Object.values(FeatureEnum) } },
    select: { code: true },
  });
  const seededCodes = new Set(rows.map((row) => row.code));
  const missing = Object.values(FeatureEnum).filter(
    (code) => !seededCodes.has(code),
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing Feature rows for FeatureEnum member(s): ${missing.join(', ')}. ` +
        'Run the database seed before starting the application.',
    );
  }
}

/**
 * Refuses to start the application if a country or state from the bundled
 * country files is missing from the database.
 */
export async function assertGeographySeeded(
  prisma: PostgreService,
): Promise<void> {
  const missing: string[] = [];

  for (const { country, states } of readCountryFiles()) {
    const existingCountry = await prisma.country.findFirst({
      where: { code: country.code },
      select: { id: true },
    });

    if (!existingCountry) {
      missing.push(`country ${country.code}`);
      continue;
    }

    const existingStates = await prisma.state.findMany({
      where: { countryId: existingCountry.id },
      select: { code: true },
    });
    const stateCodes = new Set(existingStates.map((state) => state.code));

    for (const state of states) {
      if (!stateCodes.has(state.code)) {
        missing.push(`state ${country.code}/${state.code}`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing geography rows: ${missing.join(', ')}. ` +
        'Run the database seed before starting the application.',
    );
  }
}

export async function seedProductionData(): Promise<void> {
  const prisma = new PostgreService(new ConfigService(process.env));
  await prisma.onModuleInit();

  try {
    for (const { country, states } of readCountryFiles()) {
      // Check if country exists by code
      const existingCountry = await prisma.country.findFirst({
        where: { code: country.code },
      });

      let countryId: string;
      if (existingCountry) {
        countryId = existingCountry.id;
      } else {
        countryId = Id.generate().getValue();
        await prisma.country.create({
          data: {
            id: countryId,
            name: country.name,
            code: country.code,
          },
        });
      }

      await prisma.country.upsert({
        where: { id: countryId },
        update: {},
        create: {
          id: countryId,
          name: country.name,
          code: country.code,
        },
      });

      for (const state of states) {
        // Check if state exists by code and countryId
        const existingState = await prisma.state.findFirst({
          where: {
            code: state.code,
            countryId: countryId,
          },
        });

        if (!existingState) {
          const stateId = Id.generate().getValue();
          await prisma.state.create({
            data: {
              id: stateId,
              name: state.name,
              code: state.code,
              countryId: countryId,
            },
          });
        }
      }
    }

    await assertGeographySeeded(prisma);
    logger.log('Seeding completed for all countries.');

    await seedFeatureCatalog(prisma);
    await assertFeatureCatalogSeeded(prisma);
    logger.log('Seeding completed for the feature catalog.');
  } finally {
    await prisma.onModuleDestroy();
  }
}

/**
 * Validates every seeding step in one place: init.sql objects (extensions, views),
 * the feature catalog and the geography data.
 */
export async function assertDatabaseSeeded(
  prisma: PostgreService,
): Promise<void> {
  const [extension, view] = await Promise.all([
    prisma.$queryRaw<
      unknown[]
    >`SELECT 1 FROM pg_extension WHERE extname = 'citext'`,
    prisma.$queryRaw<
      unknown[]
    >`SELECT 1 FROM pg_views WHERE schemaname = 'sales' AND viewname = 'dashboard_sales_view'`,
  ]);
  if (extension.length === 0 || view.length === 0) {
    throw new Error(
      'init.sql has not been applied (citext extension or sales.dashboard_sales_view missing). Run `npm run database`.',
    );
  }

  await assertFeatureCatalogSeeded(prisma);
  await assertGeographySeeded(prisma);
}
