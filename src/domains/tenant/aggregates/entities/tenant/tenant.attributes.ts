export interface ITenantType extends ITenantBase, ITenantSystem {}

export interface ITenantBase {
  name: string;
  authIdentityId: string;
  defaultPhoneNumberId?: string;
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface ITenantSystem {
  id: string;
  defaultStoreId?: string;
  createdAt: Date;
  updatedAt: Date;
}
