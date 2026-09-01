import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  CartCreateHandler,
  AddItemToCartHandler,
  RemoveItemFromCartHandler,
  UpdateItemQuantityHandler,
  RemoveManyItemsFromCartHandler,
} from './application/commands';
import { GetCartByIdHandler } from './application/queries';
import {
  CartCreatedHandler,
  AddItemToCartHandler as AddItemToCartEventHandler,
  ItemRemovedFromCartHandler,
  RemoveManyItemsFromCartHandler as RemoveManyItemsFromCartEventHandler,
  ItemQuantityUpdatedHandler,
} from './application/events';
import { CartResolver } from './presentation/graphql/cart.resolver';
import { CartRepository } from './infrastructure/persistence/postgres/cart.repository';
import {
  ProductAdapter,
  TenantCurrencyAdapter,
} from './infrastructure/adapters';

const CommandHandlers = [
  CartCreateHandler,
  AddItemToCartHandler,
  RemoveItemFromCartHandler,
  UpdateItemQuantityHandler,
  RemoveManyItemsFromCartHandler,
];

const QueryHandlers = [GetCartByIdHandler];

const EventHandlers = [
  CartCreatedHandler,
  AddItemToCartEventHandler,
  ItemRemovedFromCartHandler,
  RemoveManyItemsFromCartEventHandler,
  ItemQuantityUpdatedHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'ICartRepository', useClass: CartRepository },
    { provide: 'IProductAdapter', useClass: ProductAdapter },
    { provide: 'ITenantCurrencyAdapter', useClass: TenantCurrencyAdapter },
    CartResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class CartDomain {}
