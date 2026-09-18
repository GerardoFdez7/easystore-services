/** Store ownership capability required for signing and rotating scoped tokens. */
export interface IStoreAdapter {
  getStoreByDomain(
    domain: string,
  ): Promise<{ id: string; tenantId: string } | null>;

  validateStoreInTenant(
    storeId: string,
    tenantId: string,
  ): Promise<{ id: string; tenantId: string } | null>;
}
