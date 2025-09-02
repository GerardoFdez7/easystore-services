import { PostgreService } from './postgres.service';
// Remove import { Id } from '../../shared/domains/value-objects/id.vo';
import { LoggerService } from '../../shared/winston/winston.service';
import * as fs from 'fs';
import * as path from 'path';

const logger = new LoggerService();
const dataDir = path.join(__dirname, 'countries');

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

async function main(): Promise<void> {
  const prisma = new PostgreService();
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

      const countryId = country.code;

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
        const stateId = `${country.code}-${state.code}`;
        await prisma.state.upsert({
          where: { id: stateId },
          update: {},
          create: {
            id: stateId,
            name: state.name,
            code: state.code,
            countryId,
          },
        });
      }
    }

    logger.log('Seeding completed for all countries.');
  } catch (error: unknown) {
    logger.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.onModuleDestroy();
  }
}

main().catch((error: unknown) => {
  logger.error('Error during seeding:', error);
  process.exit(1);
});
