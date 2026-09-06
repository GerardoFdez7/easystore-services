import { Inject, Injectable } from '@nestjs/common';
import {
  FeatureEnum,
  PermissionActionEnum,
} from '@shared/aggregates/value-objects';
import {
  EmployeePermission,
  IEmployeeRepository,
} from '../../../aggregates/repositories/employee.interface';
import { Id } from '../../../aggregates/value-objects';

/** Resolves and checks an employee's granted (feature, action) permission set. */
@Injectable()
export class PermissionService {
  constructor(
    @Inject('EmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  /**
   * Loads the full set of (feature, action) grants for an employee, scoped to the
   * employee's tenant.
   * @param employeeId The employee ID to resolve grants for.
   * @param tenantId The tenant ID the employee belongs to.
   * @returns The employee's granted (feature, action) pairs.
   */
  loadFor(employeeId: string, tenantId: string): Promise<EmployeePermission[]> {
    return this.employeeRepository.findPermissionsByEmployeeId(
      Id.create(employeeId),
      Id.create(tenantId),
    );
  }

  /**
   * Checks whether a resolved permission set grants the given (feature, action) pair.
   * @param permissions The employee's resolved permission set.
   * @param feature The feature being checked.
   * @param action The action being checked.
   * @returns Whether the pair is granted.
   */
  has(
    permissions: EmployeePermission[],
    feature: FeatureEnum,
    action: PermissionActionEnum,
  ): boolean {
    return permissions.some(
      (permission) =>
        permission.feature === feature && permission.action === action,
    );
  }
}
