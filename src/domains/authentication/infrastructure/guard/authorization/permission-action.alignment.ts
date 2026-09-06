import { PermissionAction as PrismaPermissionAction } from '.prisma/postgres';
import { PermissionActionEnum } from '@shared/aggregates/value-objects';

/**
 * Compile-time assertion that `PermissionActionEnum` stays aligned with the
 * generated Prisma `PermissionAction` enum. Fails the build if the two drift.
 */
const _actionsAlign: Record<PermissionActionEnum, PrismaPermissionAction> = {
  [PermissionActionEnum.VIEW]: PrismaPermissionAction.VIEW,
  [PermissionActionEnum.CREATE]: PrismaPermissionAction.CREATE,
  [PermissionActionEnum.EDIT]: PrismaPermissionAction.EDIT,
  [PermissionActionEnum.DELETE]: PrismaPermissionAction.DELETE,
};

export { _actionsAlign };
