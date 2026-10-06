import fs from 'fs';
import path from 'path';
import { PrismaClient } from '.prisma/postgres';
import { isDevelopmentEnvironment } from '../../../config/environment/environment';
import { CustomLoggerService } from '../../../config/logger';
import { seedDevelopmentData } from './development.seed';
import { seedProductionData } from './production.seed';

const logger = new CustomLoggerService();

/**
 * Applies init.sql (extensions, views, ...) which Prisma migrations cannot model.
 * The file is idempotent and runs after `prisma migrate`, so objects that depend
 * on tables always find them.
 */
async function applyInitSql(): Promise<void> {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'init.sql'), 'utf8');
  const statements = sql
    .split(/;[ \t]*(?:\r?\n|$)/)
    .map((statement) =>
      statement
        .split(/\r?\n/)
        .filter((line) => !line.trimStart().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter(Boolean);

  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL_POSTGRES,
  });
  try {
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main(): Promise<void> {
  await applyInitSql();

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
