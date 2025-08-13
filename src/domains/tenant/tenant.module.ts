import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Command Handlers
import {
  TenantSingUpHandler,
  UpdateTenantHandler,
} from './application/commands';
// Event Handlers
import {
  TenantCreatedHandler,
  IdentityCreatedHandler,
} from './application/events';
import TenantRepository from './infrastructure/persistence/postgres/tenant.repository';
import { TenantResolver } from './presentation/graphql/resolvers/tenant.resolver';

// Command handlers
const CommandHandlers = [TenantSingUpHandler, UpdateTenantHandler];

// Event handlers
const EventHandlers = [TenantCreatedHandler, IdentityCreatedHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },
    TenantResolver,
    ...CommandHandlers,
    ...EventHandlers,
  ],
})
export class TenantDomain {}
