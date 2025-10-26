import { WishListItem } from '../../../aggregates/value-objects';
import { WishListDTO } from './wish-list.dto';

/**
 * Interface for persistence WishList model
 */
export interface IWishListPersistence {
  id: string;
  variantId: string;
  customerId: string;
  updatedAt: Date;
}

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
  static toPersistence(wishListItem: WishListItem): IWishListPersistence {
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
  static fromPersistence(persistence: IWishListPersistence): WishListItem {
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
}
