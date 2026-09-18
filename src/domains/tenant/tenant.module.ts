import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Command Handlers
import {
  TenantSingUpHandler,
  UpdateTenantHandler,
  SetDefaultStoreHandler,
} from './application/commands';
// Query Handlers
import {
  GetTenantByIdHandler,
  GetTenantByAuthIdentityHandler,
  ResolveTenantLoginContextHandler,
} from './application/queries';
// Event Handlers
import {
  TenantCreatedHandler,
  TenantUpdatedHandler,
} from './application/events';
import TenantRepository from './infrastructure/postgres/tenant.repository';
import { StoreOwnershipAdapter } from './infrastructure/adapters';
import TenantResolver from './presentation/graphql/tenant.resolver';

// Command handlers
const CommandHandlers = [
  TenantSingUpHandler,
  UpdateTenantHandler,
  SetDefaultStoreHandler,
];

// Query handlers
const QueryHandlers = [
  GetTenantByIdHandler,
  GetTenantByAuthIdentityHandler,
  ResolveTenantLoginContextHandler,
];

// Event handlers
const EventHandlers = [TenantCreatedHandler, TenantUpdatedHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },
    { provide: 'IStoreOwnershipAdapter', useClass: StoreOwnershipAdapter },
    TenantResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: ['ITenantRepository'],
})
export class TenantDomain {}
