export interface ITenantType extends ITenantBase, ITenantSystem {
  authIdentityId: string;
  defaultPhoneNumberId?: string;
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface ITenantBase {
  businessName: string;
  ownerName: string;
  domain?: string;
  logo?: string;
  description?: string;
  currency: string;
}

export interface ITenantSystem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
