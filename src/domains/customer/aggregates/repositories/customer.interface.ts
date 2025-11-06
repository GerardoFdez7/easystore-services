import { Id } from '@shared/value-objects';
import { Customer } from '../entities/customer.entity';

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
  ): Promise<{ id: string; tenantId: string } | null>;

  /**
   * Creates a new customer.
   * @param customer The customer object to create.
   * @returns A promise that resolves to the created customer.
   */
  create(customer: Customer): Promise<Customer>;

  /**
   * Finds a customer by their ID and tenant ID.
   * @param id The ID of the customer.
   * @param tenantId The ID of the tenant.
   * @returns A promise that resolves to the customer if found.
   */
  findCustomerById(id: Id, tenantId: Id): Promise<Customer>;

  /**
   * Updates an existing customer.
   * @param customer The customer object with updated information.
   * @param tenantId Id of tenant.
   * @returns A promise that resolves to the updated customer.
   */
  update(customer: Customer, tenantId: Id): Promise<Customer>;
}
