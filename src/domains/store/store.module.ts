import { Module } from '@nestjs/common';
import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { TransactionalEventPublisher } from '@shared/infrastructure/postgres';
import { CreateStoreHandler, UpdateStoreHandler } from './application/commands';
import { StoreCreatedHandler, StoreUpdatedHandler } from './application/events';
import {
  GetAllStoresHandler,
  GetStoreByDomainHandler,
  GetStoreByIdHandler,
  ValidateStoreInTenantHandler,
} from './application/queries';
import StoreRepository from './infrastructure/postgres/store.repository';
import StoreResolver from './presentation/graphql/store.resolver';

const CommandHandlers = [CreateStoreHandler, UpdateStoreHandler];

const QueryHandlers = [
  GetAllStoresHandler,
  GetStoreByDomainHandler,
  GetStoreByIdHandler,
  ValidateStoreInTenantHandler,
];

const EventHandlers = [StoreCreatedHandler, StoreUpdatedHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: EventPublisher, useClass: TransactionalEventPublisher },
    { provide: 'IStoreRepository', useClass: StoreRepository },
    StoreResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class StoreDomain {}
