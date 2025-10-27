import { Module } from '@nestjs/common';
import { CustomerResolver } from './presentation/graphql/customer.resolver';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCustomerHandler } from './application/commands/create/customer/create-customer.handler';
import { CustomerRepository } from './infrastructure/database/postgres/customer.repository';
import { IdentityCreatedHandler } from './application/events/customer/identity-created.handler';
import { CustomerCreatedHandler } from './application/events/customer/customer-created.handler';
import { TenantDomain } from '../tenant/tenant.module';
import { FindCustomerByIdHandler } from './application/queries';
import { UpdateCustomerHandler } from './application/commands/update/customer/update-customer.handler';
import { CustomerUpdatedHandler } from './application/events/customer/customer-updated.handler';
import { WishlistItemCreatedHandler } from './application/events/wishlist/wish-list-created.handler';
import { WishlistItemDeletedHandler } from './application/events/wishlist/wish-list-deleted.handler';
import { WishlistManyItemsDeletedHandler } from './application/events/wishlist/wish-list-many-items-deleted.handler';
import { WishListRepository } from './infrastructure/database/postgres/wish-list.repository';
import { CreateWishListHandler } from './application/commands/create/wish-list/create-wish-list.handler';
import { DeleteWishListHandler } from './application/commands/delete/wish-list/delete-wish-list.handler';
import { DeleteManyWishListHandler } from './application/commands/delete/wish-list/delete-many-wish-list.handler';
import { ProductAdapter } from './infrastructure/adapters';
import { FindWishListItemsHandler } from './application/queries/many/wish-list/find-wish-list-items.handler';
import { CustomerReviewProductRepository } from './infrastructure/database/postgres/customer-review-product.repository';
import { CreateCustomerReviewProductHandler } from './application/commands/create/review/create-customer-review-product.handler';
import { CustomerReviewProductCreatedHandler } from './application/events/review/review-created.handler';
import { UpdateCustomerReviewProductHandler } from './application/commands/update/review/update-customer-review-product.handler';
import { CustomerReviewProductUpdatedHandler } from './application/events/review/review-updated.handler';
import { DeleteCustomerReviewProductHandler } from './application/commands/delete/review/delete-customer-review-product.handler';
import { CustomerReviewProductDeletedHandler } from './application/events/review/review-deleted.handler';

const CommandHandlers = [
  CreateCustomerHandler,
  UpdateCustomerHandler,
  CreateWishListHandler,
  DeleteWishListHandler,
  DeleteManyWishListHandler,
  CreateCustomerReviewProductHandler,
  UpdateCustomerReviewProductHandler,
  DeleteCustomerReviewProductHandler,
];

const EventHandlers = [
  IdentityCreatedHandler,
  CustomerCreatedHandler,
  CustomerUpdatedHandler,
  WishlistItemCreatedHandler,
  WishlistItemDeletedHandler,
  WishlistManyItemsDeletedHandler,
  CustomerReviewProductCreatedHandler,
  CustomerReviewProductUpdatedHandler,
  CustomerReviewProductDeletedHandler,
];

const QueryHandlers = [FindCustomerByIdHandler, FindWishListItemsHandler];

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
    { provide: 'IProductAdapter', useClass: ProductAdapter },
    {
      provide: 'ICustomerReviewProductRepository',
      useClass: CustomerReviewProductRepository,
    },
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class CustomerDomain {}
