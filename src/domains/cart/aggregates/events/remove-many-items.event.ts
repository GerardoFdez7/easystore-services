import { IEvent } from '@nestjs/cqrs';
import { Cart } from '../entities/cart.entity';
import { Id } from '@shared/value-objects';

export class RemoveManyItemsFromCart implements IEvent {
  constructor(
    public readonly cart: Cart,
    public readonly variantsIds: Id[],
  ) {}
}
