import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '.prisma/postgres';

@Injectable()
export class PostgreService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Use Docker database URL only when explicitly running in Docker
    const databaseUrl =
      process.env.DOCKER_ENV === 'true'
        ? process.env.DATABASE_URL_POSTGRES_DOCKER
        : process.env.DATABASE_URL_POSTGRES;

    super({
      datasources: {
        postgres: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      logger.log('PostgreSQL database connected successfully.');
    } catch (error) {
      logger.fatal('Failed to connect to PostgreSQL database.', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    logger.warn('Disconnecting from PostgreSQL database.');
    await this.$disconnect();
  }
}
