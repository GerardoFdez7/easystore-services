/** Customer identity lookup capability required by Authentication. */
export interface ICustomerAdapter {
  findByAuthIdentityId(
    authIdentityId: string,
  ): Promise<{ id: string; storeId: string } | null>;
}
