import { IEvent } from '@nestjs/cqrs';
import { Customer } from '../../entities';
import { WishListItem } from '../../value-objects';

export class WishlistItemCreatedEvent implements IEvent {
  constructor(
    public readonly wishlistItem: WishListItem,
    public readonly customer: Customer,
  ) {}
}
