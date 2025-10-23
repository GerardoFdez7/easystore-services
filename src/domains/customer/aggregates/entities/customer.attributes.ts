export interface ICustomerBase {
  name: string;
  tenantId: string;
  authIdentityId: string;
}

export interface ICustomerCreate extends ICustomerBase {
  defaultPhoneNumberId?: string;
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}
