/** Customer capabilities required by the Authentication application layer. */
export interface ICustomerProvisioningData {
  authIdentityId: string;
  name: string;
  tenantId: string;
}

/** Customer lookup and provisioning capability required by Authentication. */
export interface ICustomerAdapter {
  findByAuthIdentityId(
    authIdentityId: string,
  ): Promise<{ id: string; tenantId: string } | null>;
  provisionCustomer(data: ICustomerProvisioningData): Promise<void>;
}
