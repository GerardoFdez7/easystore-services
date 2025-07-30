import { Id } from '../value-objects';

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
}
