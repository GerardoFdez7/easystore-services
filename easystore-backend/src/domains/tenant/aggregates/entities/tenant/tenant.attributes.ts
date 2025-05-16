export interface ITenantType extends ITenantBase, ITenantSystem {
  defaultPhoneNumberId?: number | null;
  defaultShippingAddressId?: number | null;
  defaultBillingAddressId?: number | null;
}

export interface ITenantBase {
  businessName: string;
  ownerName: string;
  domain?: string;
  logo?: string | null;
  description?: string | null;
  authIdentityId: number;
}

export interface ITenantSystem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
