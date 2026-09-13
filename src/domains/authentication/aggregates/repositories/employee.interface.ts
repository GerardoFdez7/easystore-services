import {
  FeatureEnum,
  PermissionActionEnum,
} from '@shared/aggregates/value-objects';
import { Id } from '../value-objects';

/** A single granted (feature, action) pair. */
export interface EmployeePermission {
  feature: FeatureEnum;
  action: PermissionActionEnum;
}

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

  /**
   * Resolves the full set of (feature, action) grants held by an employee's role,
   * scoped to the employee's tenant.
   * @param employeeId The employee ID whose role grants are resolved.
   * @param tenantId The tenant ID the employee belongs to.
   * @returns Promise that resolves to the granted (feature, action) pairs.
   */
  findPermissionsByEmployeeId(
    employeeId: Id,
    tenantId: Id,
  ): Promise<EmployeePermission[]>;
}
