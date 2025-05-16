import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';
import { TenantResolver } from './presentation/graphql/tenant.resolver';
import { TenantRepository } from './infrastructure/persistence/postgres/tenant.repository';
import { FindTenantByBusinessNameHandler } from './application/queries/get-businessname/businessname.handler';
import { TenantSingUpHandler } from './application/commands/create/sing-up.handler';
import { TenantCreatedHandler } from './application/events/tenant-created.handler';

// Command handlers
const CommandHandlers = [TenantSingUpHandler];

// Query handlers
const QueryHandlers = [FindTenantByBusinessNameHandler];

// Event handlers
const EventHandlers = [TenantCreatedHandler];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    TenantResolver,
    TenantRepository,
    {
      provide: 'TenantRepository',
      useClass: TenantRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class TenantDomain {}
