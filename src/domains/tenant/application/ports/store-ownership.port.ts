/** Store ownership capability needed by Tenant's default-store transition. */
export interface IStoreOwnershipAdapter {
  belongsToTenant(storeId: string, tenantId: string): Promise<boolean>;
}
