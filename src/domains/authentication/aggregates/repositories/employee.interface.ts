import { Id } from '../value-objects';

/**
 * Simple interface for employee repository operations needed for authentication.
 * This is a minimal interface until the full Employee domain is implemented.
 */
export interface IEmployeeRepository {
  /**
   * Finds an employee by its auth identity ID.
   * @param authIdentityId The auth identity ID to search for.
   * @returns Promise that resolves to employee data or null if not found.
   */
  findByAuthIdentityId(
    authIdentityId: Id,
  ): Promise<{ id: string; tenantId: string } | null>;
}
