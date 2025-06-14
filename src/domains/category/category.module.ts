import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
})
export class CategoryDomain {}
