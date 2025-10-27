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

export interface ICustomerEntity extends ICustomerCreate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishListCreated {
  variantId: string;
  customerId: string;
}

export interface ICustomerReviewCreated {
  ratingCount: number;
  comment: string;
  variantId: string;
}
