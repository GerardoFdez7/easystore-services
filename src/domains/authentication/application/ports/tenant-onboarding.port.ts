import { AuthIdentity } from '../../aggregates/entities';

/** Tenant-account provisioning capability required by Authentication. */
export interface ITenantOnboarding {
  provision(auth: AuthIdentity, initialDomain?: string): Promise<void>;
}
