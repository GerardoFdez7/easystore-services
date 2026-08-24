import { IEvent } from '@nestjs/cqrs';
import { Customer } from '../../entities';
import { WishListItem } from '../../value-objects';

export class WishlistManyItemsDeletedEvent implements IEvent {
  constructor(
    public readonly wishlistItems: WishListItem[],
    public readonly customer: Customer,
  ) {}
}
