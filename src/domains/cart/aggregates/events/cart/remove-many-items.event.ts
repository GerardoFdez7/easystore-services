import { IEvent } from '@nestjs/cqrs';
import { Cart } from '../../entities/cart/cart.entity';
import { Id } from '@shared/value-objects';

export class RemoveManyItemsFromCartEvent implements IEvent {
  constructor(
    public readonly cart: Cart,
    public readonly variantsIds: Id[],
  ) {}
}
