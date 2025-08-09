import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Command Handlers
import { TenantSingUpHandler } from './application/commands';
// Event Handlers
import {
  TenantCreatedHandler,
  IdentityCreatedHandler,
} from './application/events';
import TenantRepository from './infrastructure/persistence/postgres/tenant.repository';

// Command handlers
const CommandHandlers = [TenantSingUpHandler];

// Event handlers
const EventHandlers = [TenantCreatedHandler, IdentityCreatedHandler];

@Module({
  imports: [CqrsModule],
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
