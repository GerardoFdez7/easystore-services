import { WishListPropsWithId } from '../../../aggregates/value-objects/wish-list-item.vo';
import { WishListItem } from '../../../aggregates/value-objects';
import { PaginatedWishListItemsDTO, WishListDTO } from './wish-list.dto';

/**
 * Mapper class for WishList entity
 * Handles conversion between domain objects and persistence/DTO objects
 */
export class WishListMapper {
  /**
   * Converts a WishListItem domain object to persistence format
   * @param wishListItem The domain object to convert
   * @returns The persistence object
   */
  static toPersistence(wishListItem: WishListItem): WishListPropsWithId {
    return {
      id: wishListItem.getIdValue(),
      variantId: wishListItem.getVariantIdValue(),
      customerId: wishListItem.getCustomerIdValue(),
      updatedAt: wishListItem.getUpdatedAt(),
    };
  }

  /**
   * Converts a persistence object to WishListItem domain object
   * @param persistence The persistence object to convert
   * @returns The domain object
   */
  static fromPersistence(persistence: WishListPropsWithId): WishListItem {
    return WishListItem.fromPersistence({
      id: persistence.id,
      variantId: persistence.variantId,
      customerId: persistence.customerId,
      updatedAt: persistence.updatedAt,
    });
  }

  /**
   * Converts a WishListItem domain object to DTO format
   * @param wishListItem The domain object to convert
   * @returns The DTO object
   */
  static toDto(wishListItem: WishListItem): WishListDTO {
    return {
      id: wishListItem.getIdValue(),
      variantId: wishListItem.getVariantIdValue(),
      customerId: wishListItem.getCustomerIdValue(),
      updatedAt: wishListItem.getUpdatedAt(),
    };
  }

  /** Maps wishlist items to a paginated application DTO. */
  static toPaginatedDto(
    wishListItems: WishListItem[],
    page = 1,
    limit = 25,
  ): PaginatedWishListItemsDTO {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(50, Math.max(1, limit));
    const offset = (normalizedPage - 1) * normalizedLimit;
    const paginatedItems = wishListItems.slice(
      offset,
      offset + normalizedLimit,
    );

    return {
      wishlistItems: paginatedItems.map((item) => this.toDto(item)),
      total: wishListItems.length,
      hasMore: offset + paginatedItems.length < wishListItems.length,
    };
  }
}
