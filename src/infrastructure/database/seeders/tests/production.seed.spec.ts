import fs from 'fs';
import path from 'path';
import { FeatureEnum } from '../../../../domains/shared/aggregates/value-objects';
import { PostgreService } from '../../postgres.service';
import {
  assertDatabaseSeeded,
  assertFeatureCatalogSeeded,
  assertGeographySeeded,
} from '../production.seed';

interface CountryFile {
  country: { code: string };
  states: { code: string }[];
}

const countries: CountryFile[] = fs
  .readdirSync(path.join(__dirname, '..', '..', 'countries'))
  .filter((file) => file.endsWith('.json'))
  .map(
    (file) =>
      JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '..', '..', 'countries', file),
          'utf-8',
        ),
      ) as CountryFile,
  );

interface PrismaMock {
  feature: { findMany: jest.Mock };
  country: { findFirst: jest.Mock };
  state: { findMany: jest.Mock };
  $queryRaw: jest.Mock;
}

function createPrismaMock(): PrismaMock {
  return {
    feature: {
      findMany: jest
        .fn()
        .mockResolvedValue(
          Object.values(FeatureEnum).map((code) => ({ code })),
        ),
    },
    country: {
      findFirst: jest
        .fn()
        .mockImplementation(({ where }) =>
          Promise.resolve({ id: `id-${(where as { code: string }).code}` }),
        ),
    },
    state: {
      findMany: jest.fn().mockImplementation(({ where }) => {
        const countryCode = (where as { countryId: string }).countryId.replace(
          'id-',
          '',
        );
        const file = countries.find((c) => c.country.code === countryCode);
        return Promise.resolve(file?.states.map(({ code }) => ({ code })));
      }),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };
}

const asService = (mock: PrismaMock): PostgreService =>
  mock as unknown as PostgreService;

describe('production seed assertions', () => {
  describe('assertFeatureCatalogSeeded', () => {
    it('passes when every FeatureEnum member has a row', async () => {
      await expect(
        assertFeatureCatalogSeeded(asService(createPrismaMock())),
      ).resolves.toBeUndefined();
    });

    it('lists the missing FeatureEnum members', async () => {
      const prisma = createPrismaMock();
      const [missing, ...rest] = Object.values(FeatureEnum);
      prisma.feature.findMany.mockResolvedValue(rest.map((code) => ({ code })));

      await expect(
        assertFeatureCatalogSeeded(asService(prisma)),
      ).rejects.toThrow(
        `Missing Feature rows for FeatureEnum member(s): ${missing}`,
      );
    });
  });

  describe('assertGeographySeeded', () => {
    it('passes when every bundled country and state exists', async () => {
      await expect(
        assertGeographySeeded(asService(createPrismaMock())),
      ).resolves.toBeUndefined();
    });

    it('reports a missing country', async () => {
      const prisma = createPrismaMock();
      prisma.country.findFirst.mockResolvedValue(null);

      await expect(assertGeographySeeded(asService(prisma))).rejects.toThrow(
        `country ${countries[0].country.code}`,
      );
    });

    it('reports a missing state', async () => {
      const prisma = createPrismaMock();
      prisma.state.findMany.mockResolvedValue([]);
      const { country, states } = countries[0];

      await expect(assertGeographySeeded(asService(prisma))).rejects.toThrow(
        `state ${country.code}/${states[0].code}`,
      );
    });
  });

  describe('assertDatabaseSeeded', () => {
    it('passes when init.sql objects, features and geography exist', async () => {
      await expect(
        assertDatabaseSeeded(asService(createPrismaMock())),
      ).resolves.toBeUndefined();
    });

    it('fails when init.sql has not been applied', async () => {
      const prisma = createPrismaMock();
      prisma.$queryRaw.mockResolvedValueOnce([]);

      await expect(assertDatabaseSeeded(asService(prisma))).rejects.toThrow(
        'init.sql has not been applied',
      );
      expect(prisma.feature.findMany).not.toHaveBeenCalled();
    });

    it('propagates feature catalog failures', async () => {
      const prisma = createPrismaMock();
      prisma.feature.findMany.mockResolvedValue([]);

      await expect(assertDatabaseSeeded(asService(prisma))).rejects.toThrow(
        'Missing Feature rows',
      );
    });

    it('propagates geography failures', async () => {
      const prisma = createPrismaMock();
      prisma.country.findFirst.mockResolvedValue(null);

      await expect(assertDatabaseSeeded(asService(prisma))).rejects.toThrow(
        'Missing geography rows',
      );
    });
  });
});
