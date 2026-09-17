/** Trusted Tenant and default Store scope resolved for an owner sign-in. */
export interface ITenantLoginContext {
  tenantId: string;
  storeId: string;
}

/**
 * Tenant capabilities required by the Authentication application layer.
 * Implementations translate these operations to the Tenant bounded context.
 */
export interface ITenantAdapter {
  resolveTenantLoginContext(
    authIdentityId: string,
  ): Promise<ITenantLoginContext | null>;
}
