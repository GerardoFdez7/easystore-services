import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { IEmployeeRepository } from '../../../aggregates/repositories/employee.interface';
import { Id } from '../../../aggregates/value-objects';

@Injectable()
export class EmployeeRepository implements IEmployeeRepository {
  constructor(private readonly prisma: PostgreService) {}

  /**
   * Finds an employee by its auth identity ID and returns employee data with tenant info.
   */
  async findByAuthIdentityId(
    authIdentityId: Id,
  ): Promise<{ id: string; tenantId: string } | null> {
    const authIdentityIdValue = authIdentityId.getValue();

    try {
      const employee = await this.prisma.employee.findFirst({
        where: {
          authIdentityId: authIdentityIdValue,
        },
        select: {
          id: true,
          role: {
            select: {
              tenantId: true,
            },
          },
        },
      });

      if (!employee) {
        return null;
      }

      return {
        id: employee.id,
        tenantId: employee.role.tenantId,
      };
    } catch (_error) {
      // Log error and return null for now
      return null;
    }
  }
}
