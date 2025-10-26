import { Id } from '@shared/value-objects';
import { WishListItem } from '../value-objects';

export interface IWishListRepository {
  create(wishlistItem: WishListItem): Promise<WishListItem>;
  findWishListItemByVariantId(variantId: Id): Promise<WishListItem | null>;
  removeVariantFromWishList(customerId: Id, variantId: Id): Promise<void>;
}
