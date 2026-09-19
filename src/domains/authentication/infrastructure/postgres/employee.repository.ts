import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import {
  FeatureEnum,
  PermissionActionEnum,
} from '@shared/aggregates/value-objects';
import { handlePrismaDatabaseError } from '@shared/infrastructure/postgres';
import {
  EmployeePermission,
  IEmployeeRepository,
} from '../../aggregates/repositories/employee.interface';
import { Id } from '../../aggregates/value-objects';

@Injectable()
export class EmployeeRepository implements IEmployeeRepository {
  constructor(private readonly prisma: PostgreService) {}

  /**
   * Finds an employee by its auth identity ID and returns its Tenant and Store scope.
   */
  async findByAuthIdentityId(
    authIdentityId: Id,
  ): Promise<{ id: string; tenantId: string; storeId: string } | null> {
    const authIdentityIdValue = authIdentityId.getValue();

    try {
      const employee = await this.prisma.employee.findFirst({
        where: {
          authIdentityId: authIdentityIdValue,
        },
        select: {
          id: true,
          storeId: true,
          role: {
            select: {
              store: { select: { tenantId: true } },
            },
          },
        },
      });

      if (!employee) {
        return null;
      }

      return {
        id: employee.id,
        tenantId: employee.role.store.tenantId,
        storeId: employee.storeId,
      };
    } catch (error) {
      return this.handleDatabaseError(error, 'find employee by auth identity');
    }
  }

  /**
   * Resolves the full set of (feature, action) grants held by an employee's role,
   * scoped to the employee's Store.
   */
  async findPermissionsByEmployeeId(
    employeeId: Id,
    storeId: Id,
  ): Promise<EmployeePermission[]> {
    const employeeIdValue = employeeId.getValue();
    const storeIdValue = storeId.getValue();

    try {
      const employee = await this.prisma.employee.findFirst({
        where: {
          id: employeeIdValue,
          storeId: storeIdValue,
        },
        select: {
          role: {
            select: {
              roleFeatures: {
                where: { storeId: storeIdValue },
                select: {
                  action: true,
                  feature: { select: { code: true } },
                },
              },
            },
          },
        },
      });

      if (!employee) {
        return [];
      }

      return employee.role.roleFeatures.map((roleFeature) => ({
        feature: roleFeature.feature.code as FeatureEnum,
        action: roleFeature.action as PermissionActionEnum,
      }));
    } catch (error) {
      return this.handleDatabaseError(error, 'resolve employee permissions');
    }
  }

  /**
   * Centralized error handling for database operations.
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    return handlePrismaDatabaseError(error, operation, {
      resource: 'Employee',
    });
  }
}
