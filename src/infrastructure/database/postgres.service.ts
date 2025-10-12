import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '.prisma/postgres';

@Injectable()
export class PostgreService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PostgreService.name);

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
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error(
        `Database connection failed: ${(error as Error).message}`,
        'PostgreService',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('Database connection closed successfully');
    } catch (error) {
      this.logger.error(
        `Error closing database connection: ${(error as Error).message}`,
        'PostgreService',
      );
    }
  }
}
