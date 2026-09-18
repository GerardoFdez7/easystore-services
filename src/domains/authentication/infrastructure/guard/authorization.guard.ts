import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AccountTypeEnum } from '@authentication/aggregates/value-objects';
import {
  IsPublicKey,
  RequirePermissionKey,
  RequiredPermission,
  AllowAccountTypesKey,
} from '../../../shared/presentation/decorators';
import { JwtPayload } from '../strategies/jwt/jwt.handler';
import { PermissionService } from './authorization/permission.service';
import { EmployeePermission } from '../../aggregates/repositories/employee.interface';
// Compile-time assertion that PermissionActionEnum stays aligned with the
// generated Prisma PermissionAction enum; imported for its side effect.
import './authorization/permission-action.alignment';

interface RequestWithUser extends Request {
  user?: JwtPayload;
  __permissions?: EmployeePermission[];
}

@Injectable()
export default class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. @Public() -> allow, no identity to check.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IsPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermission = this.reflector.get<
      RequiredPermission | undefined
    >(RequirePermissionKey, context.getHandler());
    const allowedAccountTypes = this.reflector.get<
      AccountTypeEnum[] | undefined
    >(AllowAccountTypesKey, context.getHandler());

    // 2. Neither authorization decorator present -> deny and log.
    if (!requiredPermission && !allowedAccountTypes) {
      this.logger.warn(
        `Denied unannotated operation "${context.getHandler().name}" on "${context.getClass().name}". ` +
          'Add @RequirePermission or @AllowAccountTypes.',
      );
      throw new ForbiddenException('This operation is not authorized');
    }

    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<{ req: RequestWithUser }>();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('This operation is not authorized');
    }

    // 3. Account-type metadata and permissions are alternate paths. An
    // account-type match can authorize operations without a permission; when a
    // permission is also required, continue to the actor-specific checks below.
    const accountTypeAllowed = allowedAccountTypes?.includes(user.accountType);
    if (accountTypeAllowed && !requiredPermission) {
      return true;
    }

    // 4. TENANT -> allow, no role/permission lookup.
    if (user.accountType === AccountTypeEnum.TENANT) {
      return true;
    }

    // 5. CUSTOMER -> allow if it passed step 3; ownership is the handler's job.
    if (user.accountType === AccountTypeEnum.CUSTOMER) {
      if (accountTypeAllowed) {
        return true;
      }
      // No @AllowAccountTypes for a customer means only @RequirePermission was
      // present, which is a staff-only operation.
      throw new ForbiddenException('This operation is not authorized');
    }

    // 6. EMPLOYEE -> check the (feature, action) pair against the resolved set.
    if (user.accountType === AccountTypeEnum.EMPLOYEE) {
      if (!requiredPermission) {
        throw new ForbiddenException('This operation is not authorized');
      }

      if (!user.employeeId) {
        throw new ForbiddenException('This operation is not authorized');
      }

      req.__permissions ??= await this.permissionService.loadFor(
        user.employeeId,
        user.storeId,
      );

      const granted = this.permissionService.has(
        req.__permissions,
        requiredPermission.feature,
        requiredPermission.action,
      );

      if (!granted) {
        throw new ForbiddenException('This operation is not authorized');
      }

      return true;
    }

    throw new ForbiddenException('This operation is not authorized');
  }
}
