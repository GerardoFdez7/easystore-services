import { SetMetadata } from '@nestjs/common';
import {
  FeatureEnum,
  PermissionActionEnum,
} from '@shared/aggregates/value-objects';

export const RequirePermissionKey = 'requirePermission';

export interface RequiredPermission {
  feature: FeatureEnum;
  action: PermissionActionEnum;
}

// RequirePermission decorator for gating staff-facing operations by feature/action
export const RequirePermission = (
  feature: FeatureEnum,
  action: PermissionActionEnum,
): MethodDecorator => SetMetadata(RequirePermissionKey, { feature, action });
