/** Cart-provisioning capability required when a customer is created. */
export interface ICartAdapter {
  createCart(customerId: string): Promise<void>;
}
