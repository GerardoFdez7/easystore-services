import { Id, CustomerReviewProduct } from '../value-objects';

export interface ICustomerReviewProductRepository {
  create(review: CustomerReviewProduct): Promise<CustomerReviewProduct>;
  update(review: CustomerReviewProduct): Promise<CustomerReviewProduct>;

  /**
   * Finds a customer review product by its unique identifier.
   * @param id - The unique identifier of the customer review product
   * @returns Promise that resolves to the CustomerReviewProduct if found, null otherwise
   * @throws {Error} When repository operation fails
   */
  findById(id: Id, customerId: Id): Promise<CustomerReviewProduct | null>;

  /**
   * Finds multiple customer review products by customer ID and optional review IDs.
   * @param customerId - The unique identifier of the customer
   * @param reviewIds - Optional array of review IDs to filter by
   * @returns Promise that resolves to an array of CustomerReviewProduct entities
   * @throws {Error} When repository operation fails
   */
  findMany(customerId: Id, reviewIds: Id[]): Promise<CustomerReviewProduct[]>;

  /**
   * Removes a customer review product by customer ID and review ID.
   * @param customerId - The unique identifier of the customer
   * @param reviewId - The unique identifier of the review product
   * @returns Promise that resolves when the review is successfully removed
   * @throws {Error} When repository operation fails or review not found
   */
  removeReview(customerId: Id, reviewId: Id): Promise<void>;
}
