export interface ITenantType extends ITenantBase, ITenantSystem {}

export interface ITenantBase {
  name: string;
  authIdentityId: string;
  defaultStoreId?: string;
  defaultPhoneNumberId?: string;
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface ITenantSystem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
