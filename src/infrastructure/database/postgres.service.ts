import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '.prisma/postgres';

@Injectable()
export class PostgreService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    // Use Docker database URL only when explicitly running in Docker
    const databaseUrl =
      configService.get<string>('DOCKER_ENV') === 'true'
        ? configService.getOrThrow<string>('DATABASE_URL_POSTGRES_DOCKER')
        : configService.getOrThrow<string>('DATABASE_URL_POSTGRES');

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
      logger.fatal(`Failed to connect to PostgreSQL database: ${error}`);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    logger.warn('Disconnecting from PostgreSQL database.');
    await this.$disconnect();
  }
}
