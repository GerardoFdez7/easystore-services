import { AddressDetailsDTO } from '@domains/dtos/address-details.dto';

export interface IAddressAdapter {
  getAddressDetails(addressIds: string[]): Promise<AddressDetailsDTO[]>;
}
