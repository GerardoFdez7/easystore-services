import { CurrencyCodes } from '../../value-objects';

export interface ITenantType extends ITenantBase, ITenantSystem {
  businessName?: string;
  currency: CurrencyCodes;
  domain?: string;
  logo?: string;
  description?: string;
  defaultPhoneNumberId?: string;
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface ITenantBase {
  ownerName: string;
  authIdentityId: string;
}

export interface ITenantSystem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
