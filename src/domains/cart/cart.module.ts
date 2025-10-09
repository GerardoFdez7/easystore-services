import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CartResolver } from './presentation/graphql/cart.resolver';
import { CartRepository } from './infrastructure/persistence/postgres/cart.repository';
import { CartCreateHandler } from './application/commands/create/cart/create-cart.handler';
import { AddItemToCartHandler } from './application/commands/create/cart-item/add-item-to-cart.handler';
import { RemoveItemFromCartHandler } from './application/commands/delete/cart-item/remove-item-from-cart.handler';
import { GetCartByIdHandler } from './application/queries/get-cart-by-customer-id.handler';
import { UpdateItemQuantityHandler } from './application/commands/update/update-item-quantity.handler';

const CommandHandlers = [
  CartCreateHandler,
  AddItemToCartHandler,
  RemoveItemFromCartHandler,
  UpdateItemQuantityHandler,
];

const QueryHandlers = [GetCartByIdHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'ICartRepository', useClass: CartRepository },
    CartResolver,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class CartDomain {}
