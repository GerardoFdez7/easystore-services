import { AccountTypeEnum } from '../../aggregates/value-objects';

/** Trusted claims available to authentication use cases after guard validation. */
export interface IAuthenticatedContext {
  email: string;
  accountType: AccountTypeEnum;
  authIdentityId: string;
  tenantId: string;
  storeId: string;
  customerId?: string;
  employeeId?: string;
}

export type AuthenticatedContext = IAuthenticatedContext;
