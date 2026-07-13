import { CustomerReviewProductDTO } from './customer-review-product.dto';

/**
 * Data Transfer Object for CustomerReviewProduct enriched with variant details
 * Used for API responses when retrieving reviews with product information
 */
export interface CustomerReviewProductWithVariantDTO
  extends CustomerReviewProductDTO {
  // Variant details
  sku: string;
  productName: string;
  firstAttribute: { key: string; value: string };
  price: number;
  isArchived: boolean;
}

/**
 * Paginated response DTO for Customer Review Products with variant details
 */
export interface PaginatedCustomerReviewProductWithVariantDTO {
  reviews: CustomerReviewProductWithVariantDTO[];
  total: number;
  hasMore: boolean;
}
