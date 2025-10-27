import { Id } from '@shared/value-objects';
import { CustomerReviewProduct } from '../value-objects/customer-review-product.vo';

export interface ICustomerReviewProductRepository {
  create(review: CustomerReviewProduct): Promise<CustomerReviewProduct>;
  update(review: CustomerReviewProduct): Promise<CustomerReviewProduct>;

  /**
   * Finds a customer review product by its unique identifier.
   * @param id - The unique identifier of the customer review product
   * @returns Promise that resolves to the CustomerReviewProduct if found, null otherwise
   * @throws {Error} When repository operation fails
   */
  findById(id: Id): Promise<CustomerReviewProduct | null>;

  /**
   * Removes a customer review product by customer ID and review ID.
   * @param customerId - The unique identifier of the customer
   * @param reviewId - The unique identifier of the review product
   * @returns Promise that resolves when the review is successfully removed
   * @throws {Error} When repository operation fails or review not found
   */
  removeReview(customerId: Id, reviewId: Id): Promise<void>;
}
