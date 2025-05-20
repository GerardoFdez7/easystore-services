export interface IAuthIdentityBaseType {
  email: string;
  password: string;
  accountType: 'EMPLOYEE' | 'TENANT' | 'CUSTOMER';
}

export interface IAuthIdentitySystemProps {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthIdentityType
  extends IAuthIdentityBaseType,
    IAuthIdentitySystemProps {
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date | null;
  failedAttempts: number;
  lockedUntil?: Date | null;
}
