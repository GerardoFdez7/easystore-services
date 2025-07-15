import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostgresModule } from '@database/postgres.module';
import { LoggerModule } from '@winston/winston.module';
import { TenantRepository } from './infrastructure/persistence/postgres/tenant.repository';
import { TenantSingUpHandler } from './application/commands/create/sing-up.handler';
import { TenantCreatedHandler } from './application/events/tenant/tenant-created.handler';
import { IdentityCreatedHandler } from './application/events/tenant/identity-created.handler';

// Command handlers
const CommandHandlers = [TenantSingUpHandler];

// Event handlers
const EventHandlers = [TenantCreatedHandler, IdentityCreatedHandler];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    {
      provide: 'TenantRepository',
      useClass: TenantRepository,
    },
    ...CommandHandlers,
    ...EventHandlers,
  ],
})
export class TenantDomain {}
