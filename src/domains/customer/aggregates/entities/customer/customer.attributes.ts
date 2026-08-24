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

export interface ICustomerType extends ICustomerCreate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ICustomerEntity = ICustomerType;

export interface IWishListCreated {
  variantId: string;
  customerId: string;
}

export type IWishListBase = IWishListCreated;

export interface ICustomerReviewBase {
  ratingCount: number;
  comment: string;
  variantId: string;
}

export type ICustomerReviewCreated = ICustomerReviewBase;

export interface ICustomerUpdateBase {
  name?: string;
  defaultPhoneNumberId?: string;
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface ICustomerReviewUpdateBase {
  id: string;
  ratingCount?: number;
  comment?: string;
}
