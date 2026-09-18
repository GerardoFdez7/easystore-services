import { AuthIdentity } from '../../aggregates/entities';

/** Customer-account provisioning capability required by Authentication. */
export interface ICustomerOnboarding {
  provision(auth: AuthIdentity, storeId: string): Promise<void>;
}
