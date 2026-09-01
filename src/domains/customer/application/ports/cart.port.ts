/** Cart-provisioning capability required when a customer is created. */
export interface ICartAdapter {
  createCart(customerId: string, tenantId: string): Promise<void>;
}
