import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateStoreHandler, UpdateStoreHandler } from './application/commands';
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

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'IStoreRepository', useClass: StoreRepository },
    StoreResolver,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: ['IStoreRepository'],
})
export class StoreDomain {}
