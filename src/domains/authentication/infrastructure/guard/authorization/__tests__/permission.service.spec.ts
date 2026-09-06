import {
  FeatureEnum,
  PermissionActionEnum,
} from '@shared/aggregates/value-objects';
import { PermissionService } from '../permission.service';
import { IEmployeeRepository } from '../../../../aggregates/repositories/employee.interface';

describe('PermissionService', () => {
  const employeeRepository: jest.Mocked<
    Pick<IEmployeeRepository, 'findPermissionsByEmployeeId'>
  > = {
    findPermissionsByEmployeeId: jest.fn(),
  };
  let service: PermissionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PermissionService(
      employeeRepository as unknown as IEmployeeRepository,
    );
  });

  describe('loadFor', () => {
    it('resolves the granted (feature, action) set through typed ids', async () => {
      const permissions = [
        { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.VIEW },
      ];
      employeeRepository.findPermissionsByEmployeeId.mockResolvedValue(
        permissions,
      );

      const result = await service.loadFor(
        '0198b746-8c72-7a2f-9c31-6d4f9866f311',
        '0198b746-8c72-7a2f-9c31-6d4f9866f312',
      );

      expect(result).toEqual(permissions);
      expect(
        employeeRepository.findPermissionsByEmployeeId,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          value: '0198b746-8c72-7a2f-9c31-6d4f9866f311',
        }),
        expect.objectContaining({
          value: '0198b746-8c72-7a2f-9c31-6d4f9866f312',
        }),
      );
    });
  });

  describe('has', () => {
    const manager = [
      { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.VIEW },
      { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.CREATE },
      { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.EDIT },
      { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.DELETE },
      { feature: FeatureEnum.ANALYTICS, action: PermissionActionEnum.VIEW },
    ];

    it.each([
      [FeatureEnum.CATALOG, PermissionActionEnum.VIEW, true],
      [FeatureEnum.CATALOG, PermissionActionEnum.CREATE, true],
      [FeatureEnum.CATALOG, PermissionActionEnum.EDIT, true],
      [FeatureEnum.CATALOG, PermissionActionEnum.DELETE, true],
      [FeatureEnum.ANALYTICS, PermissionActionEnum.VIEW, true],
      [FeatureEnum.ANALYTICS, PermissionActionEnum.CREATE, false],
      [FeatureEnum.SETTINGS, PermissionActionEnum.VIEW, false],
      [FeatureEnum.ORDERS, PermissionActionEnum.EDIT, false],
    ])(
      'grants (%s, %s) => %s per the resolved set',
      (feature, action, expected) => {
        expect(service.has(manager, feature, action)).toBe(expected);
      },
    );

    it('denies every pair against an empty permission set', () => {
      expect(
        service.has([], FeatureEnum.CATALOG, PermissionActionEnum.VIEW),
      ).toBe(false);
    });
  });
});
