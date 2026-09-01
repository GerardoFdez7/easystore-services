import { Id, CustomerReviewProduct } from '../value-objects';

/** Durable operations required for customer-owned product reviews. */
export interface ICustomerReviewProductRepository {
  /**
   * Persists a new customer review product entity to the repository.
   * @param review - The CustomerReviewProduct entity to be created
   * @returns Promise that resolves to the created CustomerReviewProduct entity
   * @throws {Error} When repository operation fails
   */
  create(review: CustomerReviewProduct): Promise<CustomerReviewProduct>;

  /**
   * Updates an existing customer review product entity in the repository.
   * @param review - The CustomerReviewProduct entity to be updated
   * @returns Promise that resolves to the updated CustomerReviewProduct entity
   * @throws {Error} When repository operation fails or review not found
   */
  update(review: CustomerReviewProduct): Promise<CustomerReviewProduct>;

  /**
   * Finds a customer review product by its unique identifier.
   * @param id - The unique identifier of the customer review product
   * @returns Promise that resolves to the CustomerReviewProduct if found, null otherwise
   * @throws {Error} When repository operation fails
   */
  findById(
    id: Id,
    customerId: Id,
    tenantId: Id,
  ): Promise<CustomerReviewProduct | null>;

  /**
   * Finds multiple customer review products by customer ID and optional review IDs.
   * @param customerId - The unique identifier of the customer
   * @param reviewIds - Optional array of review IDs to filter by
   * @returns Promise that resolves to an array of CustomerReviewProduct entities
   * @throws {Error} When repository operation fails
   */
  findMany(
    customerId: Id,
    reviewIds: Id[],
    tenantId: Id,
  ): Promise<CustomerReviewProduct[]>;

  /**
   * Removes a customer review product by customer ID and review ID.
   * @param customerId - The unique identifier of the customer
   * @param reviewId - The unique identifier of the review product
   * @returns Promise that resolves when the review is successfully removed
   * @throws {Error} When repository operation fails or review not found
   */
  removeReview(customerId: Id, reviewId: Id, tenantId: Id): Promise<void>;
}
