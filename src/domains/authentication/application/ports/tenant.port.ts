/**
 * Data required to provision a tenant for a newly registered identity.
 */
export interface ITenantProvisioningData {
  ownerName: string;
  authIdentityId: string;
}

/**
 * Tenant capabilities required by the Authentication application layer.
 * Implementations translate these operations to the Tenant bounded context.
 */
export interface ITenantAdapter {
  provisionTenant(data: ITenantProvisioningData): Promise<void>;
  getTenantIdByAuthIdentityId(authIdentityId: string): Promise<string | null>;
}
