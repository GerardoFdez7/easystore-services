import {
  CustomerReviewProduct,
  CustomerReviewProductPropsWithId,
} from '../../../aggregates/value-objects/customer-review-product.vo';
import {
  CustomerReviewProductDTO,
  PaginatedCustomerReviewProductDTO,
} from './customer-review-product.dto';

/**
 * Mapper class for CustomerReviewProduct entity
 * Handles conversion between domain objects and persistence/DTO objects
 */
export class CustomerReviewProductMapper {
  /**
   * Converts a CustomerReviewProduct domain object to persistence format
   * @param review The domain object to convert
   * @returns The persistence object
   */
  static toPersistence(
    review: CustomerReviewProduct,
  ): CustomerReviewProductPropsWithId {
    return {
      id: review.getIdValue(),
      ratingCount: review.getRatingCount(),
      comment: review.getCommentValue(),
      customerId: review.getCustomerIdValue(),
      variantId: review.getVariantIdValue(),
      tenantId: review.getTenantIdValue(),
      updatedAt: review.getUpdatedAt(),
    };
  }

  /**
   * Converts a persistence object to CustomerReviewProduct domain object
   * @param persistence The persistence object to convert
   * @returns The domain object
   */
  static fromPersistence(
    persistence: CustomerReviewProductPropsWithId,
  ): CustomerReviewProduct {
    return CustomerReviewProduct.fromPersistence({
      id: persistence.id,
      ratingCount: persistence.ratingCount,
      comment: persistence.comment,
      customerId: persistence.customerId,
      variantId: persistence.variantId,
      tenantId: persistence.tenantId,
      updatedAt: persistence.updatedAt,
    });
  }

  /**
   * Converts a CustomerReviewProduct domain object to DTO format
   * @param review The domain object to convert
   * @returns The DTO object
   */
  static toDto(review: CustomerReviewProduct): CustomerReviewProductDTO {
    return this.toPersistence(review);
  }

  /**
   * Converts an array of CustomerReviewProduct domain objects to an array of DTOs
   * @param reviews The array of domain objects to convert
   * @returns Array of DTO objects
   */
  static toDtoArray(
    reviews: CustomerReviewProduct[],
  ): CustomerReviewProductDTO[] {
    return reviews.map((review) => this.toDto(review));
  }

  /**
   * Maps paginated reviews data to PaginatedCustomerReviewProductDTO
   * @param reviews Array of review entities
   * @param total Total count of reviews
   * @param hasMore Whether there are more reviews available
   * @returns Paginated reviews DTO
   */
  static toPaginatedDto(
    reviews: CustomerReviewProduct[],
    page = 1,
    limit = 25,
  ): PaginatedCustomerReviewProductDTO {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(50, Math.max(1, limit));
    const offset = (normalizedPage - 1) * normalizedLimit;
    const paginatedReviews = reviews.slice(offset, offset + normalizedLimit);

    return {
      reviews: this.toDtoArray(paginatedReviews),
      total: reviews.length,
      hasMore: offset + paginatedReviews.length < reviews.length,
    };
  }
}
