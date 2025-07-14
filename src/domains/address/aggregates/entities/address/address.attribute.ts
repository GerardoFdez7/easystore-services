import { AddressTypeEnum } from '../../value-objects';

export interface IAddressType extends IAddressBase, IAddressSytem {}
export interface IAddressBase {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  city: string;
  countryId: string;
  addressType: AddressTypeEnum;
  deliveryNum?: string;
  tenantId?: string;
  customerId?: string;
}

export interface IAddressSytem {
  id: string;
}
