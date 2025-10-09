import { IEvent } from '@nestjs/cqrs';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../value-objects';

export class ItemQuantityUpdatedEvent implements IEvent {
  constructor(
    public readonly cart: Cart,
    public readonly item: CartItem,
  ) {}
}
