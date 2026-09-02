import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import {
  CreateCustomerHandler,
  CreateCustomerReviewProductHandler,
  CreateWishListHandler,
  DeleteCustomerReviewProductHandler,
  DeleteManyWishListHandler,
  DeleteWishListHandler,
  UpdateCustomerHandler,
  UpdateCustomerReviewProductHandler,
} from './application/commands';
import {
  CustomerCreatedHandler,
  CustomerReviewProductCreatedHandler,
  CustomerReviewProductDeletedHandler,
  CustomerReviewProductUpdatedHandler,
  CustomerUpdatedHandler,
  WishlistItemCreatedHandler,
  WishlistItemDeletedHandler,
  WishlistManyItemsDeletedHandler,
} from './application/events';
import {
  FindCustomerByAuthIdentityIdHandler,
  FindCustomerByIdHandler,
  FindManyCustomerReviewsHandler,
  FindWishListItemsHandler,
} from './application/queries';
import { CartAdapter, ProductAdapter } from './infrastructure/adapters';
import {
  CustomerRepository,
  CustomerReviewProductRepository,
  WishListRepository,
} from './infrastructure/postgres';
import { CustomerResolver } from './presentation/graphql/customer.resolver';

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
  CustomerCreatedHandler,
  CustomerUpdatedHandler,
  WishlistItemCreatedHandler,
  WishlistItemDeletedHandler,
  WishlistManyItemsDeletedHandler,
  CustomerReviewProductCreatedHandler,
  CustomerReviewProductUpdatedHandler,
  CustomerReviewProductDeletedHandler,
];

const QueryHandlers = [
  FindCustomerByAuthIdentityIdHandler,
  FindCustomerByIdHandler,
  FindWishListItemsHandler,
  FindManyCustomerReviewsHandler,
];

@Module({
  imports: [CqrsModule],
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
    { provide: 'ICartAdapter', useClass: CartAdapter },
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
