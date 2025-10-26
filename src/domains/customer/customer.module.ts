import { Module } from '@nestjs/common';
import { CustomerResolver } from './presentation/graphql/customer.resolver';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCustomerHandler } from './application/commands/create/customer/create-customer.handler';
import { CustomerRepository } from './infrastructure/database/postgres/customer.repository';
import { IdentityCreatedHandler } from './application/events/customer/identity-created.handler';
import { CustomerCreatedHandler } from './application/events/customer/customer-created.handler';
import { TenantDomain } from '../tenant/tenant.module';
import { FindCustomerByIdHandler } from './application/queries';
import { UpdateCustomerHandler } from './application/commands/update/update-customer.handler';
import { CustomerUpdatedHandler } from './application/events/customer/customer-updated.handler';
import { WishlistItemCreatedHandler } from './application/events/wishlist/wish-list-created.handler';
import { WishlistItemDeletedHandler } from './application/events/wishlist/wish-list-deleted.handler';
import { WishListRepository } from './infrastructure/database/postgres/wish-list.repository';
import { CreateWishListHandler } from './application/commands/create/wish-list/create-wish-list.handler';
import { DeleteWishListHandler } from './application/commands/delete/wish-list/delete-wish-list.handler';

const CommandHandlers = [
  CreateCustomerHandler,
  UpdateCustomerHandler,
  CreateWishListHandler,
  DeleteWishListHandler,
];

const EventHandlers = [
  IdentityCreatedHandler,
  CustomerCreatedHandler,
  CustomerUpdatedHandler,
  WishlistItemCreatedHandler,
  WishlistItemDeletedHandler,
];

const QueryHandlers = [FindCustomerByIdHandler];

@Module({
  imports: [CqrsModule, TenantDomain],
  providers: [
    CustomerResolver,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
    {
      provide: 'IWishListRepository',
      useClass: WishListRepository,
    },
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class CustomerDomain {}
