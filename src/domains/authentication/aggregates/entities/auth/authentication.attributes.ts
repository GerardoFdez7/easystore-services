import { AccountTypeEnum } from '../../value-objects';

export interface IAuthIdentityBaseType {
  email: string;
  password: string;
  accountType: AccountTypeEnum;
}

export interface IAuthIdentitySystemProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthIdentityType
  extends IAuthIdentityBaseType,
    IAuthIdentitySystemProps {
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  failedAttempts: number;
  lockedUntil?: Date;
}
