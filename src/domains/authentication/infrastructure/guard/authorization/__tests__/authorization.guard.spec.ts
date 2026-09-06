import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountTypeEnum } from '@authentication/aggregates/value-objects';
import {
  FeatureEnum,
  PermissionActionEnum,
} from '@shared/aggregates/value-objects';
import {
  IsPublicKey,
  RequirePermissionKey,
  AllowAccountTypesKey,
} from '../../../../../shared/presentation/decorators';
import { JwtPayload } from '../../../strategies/jwt/jwt.handler';
import AuthorizationGuard from '../../authorization.guard';
import { PermissionService } from '../permission.service';

describe('AuthorizationGuard', () => {
  const reflector = { get: jest.fn(), getAllAndOverride: jest.fn() };
  const permissionService = {
    loadFor: jest.fn(),
    has: jest.fn(),
  };
  let guard: AuthorizationGuard;

  const buildContext = (
    user: JwtPayload | undefined,
    req: Record<string, unknown> = {},
  ): ExecutionContext => {
    const handler = jest.fn();
    const getHandlerMock = jest.fn().mockReturnValue(handler);
    const getClassMock = jest.fn().mockReturnValue(class TestResolver {});

    return {
      getHandler: getHandlerMock,
      getClass: getClassMock,
      getType: () => 'graphql',
      getArgs: () => [{}, {}, { req: { user, ...req } }, {}],
      switchToHttp: () => ({
        getRequest: () => ({ user, ...req }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new AuthorizationGuard(
      reflector as unknown as Reflector,
      permissionService as unknown as PermissionService,
    );
  });

  const mockMetadata = (options: {
    isPublic?: boolean;
    requirePermission?: { feature: FeatureEnum; action: PermissionActionEnum };
    allowAccountTypes?: AccountTypeEnum[];
  }): void => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === IsPublicKey) return options.isPublic;
      return undefined;
    });
    reflector.get.mockImplementation((key: string) => {
      if (key === RequirePermissionKey) return options.requirePermission;
      if (key === AllowAccountTypesKey) return options.allowAccountTypes;
      return undefined;
    });
  };

  it('allows a @Public() operation without checking identity', async () => {
    mockMetadata({ isPublic: true });
    const context = buildContext(undefined);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('denies and does not throw a distinct error type for an unannotated operation', async () => {
    mockMetadata({});
    const context = buildContext({
      accountType: AccountTypeEnum.TENANT,
    } as JwtPayload);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('denies when @AllowAccountTypes is present and the caller type is absent from it', async () => {
    mockMetadata({ allowAccountTypes: [AccountTypeEnum.CUSTOMER] });
    const context = buildContext({
      accountType: AccountTypeEnum.EMPLOYEE,
      employeeId: 'employee-1',
      tenantId: 'tenant-1',
    } as JwtPayload);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('short-circuits to allow a TENANT without any permission lookup', async () => {
    mockMetadata({
      requirePermission: {
        feature: FeatureEnum.CATALOG,
        action: PermissionActionEnum.CREATE,
      },
    });
    const context = buildContext({
      accountType: AccountTypeEnum.TENANT,
    } as JwtPayload);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(permissionService.loadFor).not.toHaveBeenCalled();
  });

  it('allows a CUSTOMER that passed the account-type gate without a feature check', async () => {
    mockMetadata({ allowAccountTypes: [AccountTypeEnum.CUSTOMER] });
    const context = buildContext({
      accountType: AccountTypeEnum.CUSTOMER,
      customerId: 'customer-1',
    } as JwtPayload);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(permissionService.loadFor).not.toHaveBeenCalled();
  });

  it('denies a CUSTOMER on a staff-only operation with no @AllowAccountTypes', async () => {
    mockMetadata({
      requirePermission: {
        feature: FeatureEnum.CATALOG,
        action: PermissionActionEnum.VIEW,
      },
    });
    const context = buildContext({
      accountType: AccountTypeEnum.CUSTOMER,
      customerId: 'customer-1',
    } as JwtPayload);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows an EMPLOYEE holding the required (feature, action) grant', async () => {
    mockMetadata({
      requirePermission: {
        feature: FeatureEnum.CATALOG,
        action: PermissionActionEnum.CREATE,
      },
    });
    const req: Record<string, unknown> = {};
    const context = buildContext(
      {
        accountType: AccountTypeEnum.EMPLOYEE,
        employeeId: 'employee-1',
        tenantId: 'tenant-1',
      } as JwtPayload,
      req,
    );
    permissionService.loadFor.mockResolvedValue([
      { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.CREATE },
    ]);
    permissionService.has.mockReturnValue(true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(permissionService.loadFor).toHaveBeenCalledWith(
      'employee-1',
      'tenant-1',
    );
  });

  it('denies an EMPLOYEE missing the required (feature, action) grant', async () => {
    mockMetadata({
      requirePermission: {
        feature: FeatureEnum.CATALOG,
        action: PermissionActionEnum.DELETE,
      },
    });
    const context = buildContext({
      accountType: AccountTypeEnum.EMPLOYEE,
      employeeId: 'employee-1',
      tenantId: 'tenant-1',
    } as JwtPayload);
    permissionService.loadFor.mockResolvedValue([
      { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.VIEW },
    ]);
    permissionService.has.mockReturnValue(false);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('memoises the resolved permission set on the request for a single request', async () => {
    mockMetadata({
      requirePermission: {
        feature: FeatureEnum.CATALOG,
        action: PermissionActionEnum.VIEW,
      },
    });
    const req: Record<string, unknown> = {
      __permissions: [
        { feature: FeatureEnum.CATALOG, action: PermissionActionEnum.VIEW },
      ],
    };
    const context = buildContext(
      {
        accountType: AccountTypeEnum.EMPLOYEE,
        employeeId: 'employee-1',
        tenantId: 'tenant-1',
      } as JwtPayload,
      req,
    );
    permissionService.has.mockReturnValue(true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(permissionService.loadFor).not.toHaveBeenCalled();
  });
});
