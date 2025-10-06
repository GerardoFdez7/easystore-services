import { IEvent } from '@nestjs/cqrs';
import { Cart } from '../entities/cart.entity';

export class CartCreatedEvent implements IEvent {
  constructor(public readonly cart: Cart) {}
}
