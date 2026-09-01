import { isDevelopmentEnvironment } from '../../../config/environment/environment';
import { CustomLoggerService } from '../../../config/logger';
import { seedDevelopmentData } from './development.seed';
import { seedProductionData } from './production.seed';

const logger = new CustomLoggerService();

async function main(): Promise<void> {
  if (isDevelopmentEnvironment(process.env)) {
    await seedDevelopmentData();
    return;
  }

  await seedProductionData();
}

main().catch((error: unknown) => {
  logger.error('Database seed failed.', error);
  process.exitCode = 1;
});
