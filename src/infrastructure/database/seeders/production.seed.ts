import fs from 'fs';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from '../../../config/logger';
import { Id } from '../../../domains/shared/value-objects';
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

export async function seedProductionData(): Promise<void> {
  const prisma = new PostgreService(new ConfigService(process.env));
  await prisma.onModuleInit();

  try {
    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const data = JSON.parse(
        fs.readFileSync(filePath, 'utf-8'),
      ) as CountryFileData;
      const { country, states } = data;

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

    logger.log('Seeding completed for all countries.');
  } finally {
    await prisma.onModuleDestroy();
  }
}
