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
