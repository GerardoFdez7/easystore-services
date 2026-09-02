import { Id } from '@shared/aggregates/value-objects';
import { WishListItem } from '../value-objects';

/** Durable operations required for customer-owned wish-list items. */
export interface IWishListRepository {
  /**
   * Creates a new wish list item.
   * @param wishlistItem The wish list item to create.
   * @returns A promise that resolves to the created wish list item.
   */
  create(wishlistItem: WishListItem): Promise<WishListItem>;

  /**
   * Finds a wish list item by its variant ID scoped to a specific customer.
   * @param customerId The ID of the owning customer.
   * @param variantId The ID of the variant to search for.
   * @returns A promise that resolves to the wish list item if found, otherwise null.
   */
  findWishListItemByVariantId(
    customerId: Id,
    variantId: Id,
    tenantId: Id,
  ): Promise<WishListItem | null>;

  /**
   * Removes a variant from the customer's wish list.
   * @param customerId The ID of the customer.
   * @param variantId The ID of the variant to remove.
   * @returns A promise that resolves to the removed wish list item.
   */
  removeVariantFromWishList(
    customerId: Id,
    variantId: Id,
    tenantId: Id,
  ): Promise<WishListItem | null>;

  /**
   * Removes multiple variants from the customer's wish list.
   * @param customerId The ID of the customer.
   * @param variantIds An array of variant IDs to remove.
   * @returns A promise that resolves to an array of the removed wish list items.
   */
  removeManyFromWishList(
    customerId: Id,
    variantIds: Id[],
    tenantId: Id,
  ): Promise<WishListItem[]>;

  /** Retrieves all wish-list items owned by one customer. */
  findMany(customerId: Id, tenantId: Id): Promise<WishListItem[]>;
}
