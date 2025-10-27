/**
 * Data Transfer Object for WishList entity
 * Used for API responses when creating or retrieving wishlist items
 */
export interface WishListDTO {
  id: string;
  variantId: string;
  customerId: string;
  updatedAt: Date;
}

/**
 * Data Transfer Object for WishList item enriched with variant details
 * Used for API responses when retrieving wishlist items with product information
 */
export interface WishlistItemWithVariantDTO extends WishListDTO {
  // Variant details
  sku: string;
  productName: string;
  firstAttribute: { key: string; value: string };
  price: number;
  isArchived: boolean;
}
