import { IEvent } from '@nestjs/cqrs';
import { Cart } from '../entities/cart.entity';

export class ItemQuantityUpdatedEvent implements IEvent {
  constructor(public readonly cart: Cart) {}
}
