import { SetMetadata } from '@nestjs/common';
import { AccountTypeEnum } from '@shared/aggregates/value-objects';

export const AllowAccountTypesKey = 'allowAccountTypes';

// AllowAccountTypes decorator for gating which account types may reach an operation
export const AllowAccountTypes = (
  ...accountTypes: AccountTypeEnum[]
): MethodDecorator => SetMetadata(AllowAccountTypesKey, accountTypes);
