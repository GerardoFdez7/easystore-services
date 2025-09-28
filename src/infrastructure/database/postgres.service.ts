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
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
