import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Command Handlers
import {
  TenantSingUpHandler,
  UpdateTenantHandler,
} from './application/commands';
// Query Handlers
import {
  GetTenantByIdHandler,
  GetTenantByAuthIdentityHandler,
} from './application/queries';
// Event Handlers
import {
  TenantCreatedHandler,
  TenantUpdatedHandler,
} from './application/events';
import TenantRepository from './infrastructure/persistence/postgres/tenant.repository';
import TenantResolver from './presentation/graphql/tenant.resolver';

// Command handlers
const CommandHandlers = [TenantSingUpHandler, UpdateTenantHandler];

// Query handlers
const QueryHandlers = [GetTenantByIdHandler, GetTenantByAuthIdentityHandler];

// Event handlers
const EventHandlers = [TenantCreatedHandler, TenantUpdatedHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },
    TenantResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class TenantDomain {}
