import {
  FeatureEnum,
  PermissionActionEnum,
} from '@shared/aggregates/value-objects';
import { EmployeeRepository } from '../employee.repository';
import { Id } from '../../../aggregates/value-objects';

describe('EmployeeRepository', () => {
  const prisma = {
    employee: { findFirst: jest.fn() },
  };
  let repository: EmployeeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new EmployeeRepository(prisma as never);
  });

  describe('findPermissionsByEmployeeId', () => {
    const employeeId = Id.create('0198b746-8c72-7a2f-9c31-6d4f9866f311');
    const tenantId = Id.create('0198b746-8c72-7a2f-9c31-6d4f9866f312');

    it('maps a role grid to its granted (feature, action) pairs, scoped by tenant', async () => {
      prisma.employee.findFirst.mockResolvedValue({
        role: {
          roleFeatures: [
            { action: 'VIEW', feature: { code: 'CATALOG' } },
            { action: 'CREATE', feature: { code: 'CATALOG' } },
            { action: 'VIEW', feature: { code: 'ANALYTICS' } },
          ],
        },
      });

      const result = await repository.findPermissionsByEmployeeId(
        employeeId,
        tenantId,
      );

      expect(result).toEqual([
        { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.VIEW },
        { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.CREATE },
        { feature: FeatureEnum.ANALYTICS, action: PermissionActionEnum.VIEW },
      ]);
      expect(prisma.employee.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: employeeId.getValue(),
            tenantId: tenantId.getValue(),
          },
        }),
      );
    });

    it('scopes the roleFeatures lookup itself by tenant, not just the employee', async () => {
      prisma.employee.findFirst.mockResolvedValue({
        role: { roleFeatures: [] },
      });

      await repository.findPermissionsByEmployeeId(employeeId, tenantId);

      const call = prisma.employee.findFirst.mock.calls[0][0] as {
        select: {
          role: { select: { roleFeatures: { where: { tenantId: string } } } };
        };
      };
      expect(call.select.role.select.roleFeatures.where.tenantId).toBe(
        tenantId.getValue(),
      );
    });

    it('returns an empty set when the employee does not resolve for that tenant', async () => {
      prisma.employee.findFirst.mockResolvedValue(null);

      const result = await repository.findPermissionsByEmployeeId(
        employeeId,
        tenantId,
      );

      expect(result).toEqual([]);
    });

    it('returns an empty set when the resolved role grants nothing', async () => {
      prisma.employee.findFirst.mockResolvedValue({
        role: { roleFeatures: [] },
      });

      const result = await repository.findPermissionsByEmployeeId(
        employeeId,
        tenantId,
      );

      expect(result).toEqual([]);
    });

    it('surfaces a database failure as a typed error instead of an empty set', async () => {
      prisma.employee.findFirst.mockRejectedValue(
        new Error('connection terminated unexpectedly'),
      );

      await expect(
        repository.findPermissionsByEmployeeId(employeeId, tenantId),
      ).rejects.toMatchObject({ code: 'DATABASE_OPERATION_ERROR' });
    });
  });

  describe('findByAuthIdentityId', () => {
    const authIdentityId = Id.create('0198b746-8c72-7a2f-9c31-6d4f9866f313');

    it('returns the employee id and tenant id for a matching auth identity', async () => {
      prisma.employee.findFirst.mockResolvedValue({
        id: 'employee-1',
        role: { tenantId: 'tenant-1' },
      });

      const result = await repository.findByAuthIdentityId(authIdentityId);

      expect(result).toEqual({ id: 'employee-1', tenantId: 'tenant-1' });
    });

    it('returns null when no employee matches the auth identity', async () => {
      prisma.employee.findFirst.mockResolvedValue(null);

      const result = await repository.findByAuthIdentityId(authIdentityId);

      expect(result).toBeNull();
    });

    it('surfaces a database failure as a typed error instead of null', async () => {
      prisma.employee.findFirst.mockRejectedValue(
        new Error('connection terminated unexpectedly'),
      );

      await expect(
        repository.findByAuthIdentityId(authIdentityId),
      ).rejects.toMatchObject({ code: 'DATABASE_OPERATION_ERROR' });
    });
  });
});
