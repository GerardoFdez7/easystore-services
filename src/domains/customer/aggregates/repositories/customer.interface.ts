import { Id } from '@shared/aggregates/value-objects';
import { Customer } from '../entities';

/**
 * Simple interface for customer repository operations needed for authentication.
 * This is a minimal interface until the full Customer domain is implemented.
 */
export interface ICustomerRepository {
  /**
   * Finds a customer by its auth identity ID.
   * @param authIdentityId The auth identity ID to search for.
   * @returns Promise that resolves to customer data or null if not found.
   */
  findByAuthIdentityId(
    authIdentityId: Id,
  ): Promise<{ id: string; storeId: string } | null>;

  /**
   * Creates a new customer.
   * @param customer The customer object to create.
   * @returns A promise that resolves to the created customer.
   */
  create(customer: Customer): Promise<Customer>;

  /**
   * Finds a customer by their ID and Store ID.
   * @param id The ID of the customer.
   * @param storeId The ID of the Store.
   * @returns A promise that resolves to the customer if found.
   */
  findById(id: Id, storeId: Id): Promise<Customer | null>;

  /**
   * Updates an existing customer.
   * @param customer The customer object with updated information.
   * @param storeId Id of Store.
   * @returns A promise that resolves to the updated customer.
   */
  update(customer: Customer, storeId: Id): Promise<Customer>;
}
