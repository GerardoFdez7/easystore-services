import { Customer } from '../entities';
import { WishListItem } from '../value-objects';

export class WishlistManyItemsDeletedEvent {
  constructor(
    public readonly wishlistItems: WishListItem[],
    public readonly customer: Customer,
  ) {}
}
