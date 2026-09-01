/**
 * Data Transfer Object for WishList entity
 * Used for API responses when creating or retrieving wishlist items
 */
export interface WishListDTO {
  id: string;
  variantId: string;
  customerId: string;
  tenantId: string;
  updatedAt: Date;
}

/**
 * Paginated response DTO for base wishlist items.
 */
export interface PaginatedWishListItemsDTO {
  wishlistItems: WishListDTO[];
  total: number;
  hasMore: boolean;
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

/**
 * Paginated response DTO for Wishlist items with variant details
 */
export interface PaginatedWishlistDTO {
  wishlistItems: WishlistItemWithVariantDTO[];
  total: number;
  hasMore: boolean;
}

export interface WishListDeletionResultDTO {
  id: string | null;
  variantId: string;
  status: number;
  message: string;
}

export interface WishListDeletionSummaryDTO {
  total: number;
  successful: number;
  failed: number;
}

export interface WishListMultiStatusDTO {
  summary: WishListDeletionSummaryDTO;
  results: WishListDeletionResultDTO[];
}
