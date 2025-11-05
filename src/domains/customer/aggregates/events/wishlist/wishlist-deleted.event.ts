import { Customer } from '../../entities';
import { WishListItem } from '../../value-objects';

export class WishlistItemDeletedEvent {
  constructor(
    public readonly wishlistItem: WishListItem,
    public readonly customer: Customer,
  ) {}
}
