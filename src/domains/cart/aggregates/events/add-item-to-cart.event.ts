import { IEvent } from '@nestjs/cqrs';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../value-objects';

export class AddItemToCartEvent implements IEvent {
  constructor(
    public readonly cart: Cart,
    public readonly item: CartItem,
  ) {}
}
