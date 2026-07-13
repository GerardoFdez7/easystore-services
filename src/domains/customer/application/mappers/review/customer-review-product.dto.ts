/**
 * Data Transfer Object for CustomerReviewProduct entity
 * Used for API responses when creating or retrieving customer product reviews
 */
export interface CustomerReviewProductDTO {
  id: string;
  ratingCount: number;
  comment: string;
  customerId: string;
  variantId: string;
  updatedAt: Date;
}

/**
 * Interface for paginated customer review results
 */
export interface PaginatedCustomerReviewProductDTO {
  reviews: CustomerReviewProductDTO[];
  total: number;
  hasMore: boolean;
}
