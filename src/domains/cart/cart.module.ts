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
  CustomerCreatedHandler,
  AddItemToCartHandler as AddItemToCartEventHandler,
  ItemRemovedFromCartHandler,
  RemoveManyItemsFromCartHandler as RemoveManyItemsFromCartEventHandler,
  ItemQuantityUpdatedHandler,
} from './application/events';
import { CartResolver } from './presentation/graphql/cart.resolver';
import { CartRepository } from './infrastructure/persistence/postgres/cart.repository';
import { ProductAdapter } from './infrastructure/adapters/product.adapter';

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
  CustomerCreatedHandler,
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
    CartResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class CartDomain {}
