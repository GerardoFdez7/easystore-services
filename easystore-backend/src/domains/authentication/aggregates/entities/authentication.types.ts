export interface IAuthIdentityBaseType {
  email: string;
  password: string;
  accountType: 'ADMIN' | 'TENANT' | 'CUSTOMER';
}

export interface IAuthIdentitySystemProps {
  id: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date | null;
  failedAttempts: number;
  lockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthIdentityType
  extends IAuthIdentityBaseType,
    IAuthIdentitySystemProps {}
