import { CustomerReviewProduct } from '../../../aggregates/value-objects/customer-review-product.vo';
import {
  CustomerReviewProductDTO,
  PaginatedCustomerReviewProductDTO,
} from './customer-review-product.dto';

/**
 * Interface for persistence CustomerReviewProduct model
 */
export interface ICustomerReviewProductPersistence {
  id: string;
  ratingCount: number;
  comment: string;
  customerId: string;
  variantId: string;
  updatedAt: Date;
}

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
  ): ICustomerReviewProductPersistence {
    return {
      id: review.getIdValue(),
      ratingCount: review.getRatingCount(),
      comment: review.getCommentValue(),
      customerId: review.getCustomerIdValue(),
      variantId: review.getVariantIdValue(),
      updatedAt: review.getUpdatedAt(),
    };
  }

  /**
   * Converts a persistence object to CustomerReviewProduct domain object
   * @param persistence The persistence object to convert
   * @returns The domain object
   */
  static fromPersistence(
    persistence: ICustomerReviewProductPersistence,
  ): CustomerReviewProduct {
    return CustomerReviewProduct.fromPersistence({
      id: persistence.id,
      ratingCount: persistence.ratingCount,
      comment: persistence.comment,
      customerId: persistence.customerId,
      variantId: persistence.variantId,
      updatedAt: persistence.updatedAt,
    });
  }

  /**
   * Converts a CustomerReviewProduct domain object to DTO format
   * @param review The domain object to convert
   * @returns The DTO object
   */
  static toDto(review: CustomerReviewProduct): CustomerReviewProductDTO {
    return {
      id: review.getIdValue(),
      ratingCount: review.getRatingCount(),
      comment: review.getCommentValue(),
      customerId: review.getCustomerIdValue(),
      variantId: review.getVariantIdValue(),
      updatedAt: review.getUpdatedAt(),
    };
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
    total: number,
    hasMore: boolean,
  ): PaginatedCustomerReviewProductDTO {
    return {
      reviews: this.toDtoArray(reviews),
      total,
      hasMore,
    };
  }
}
