import { AddressDetailsDTO } from '@shared/dtos/address-details.dto';

export interface IAddressAdapter {
  getAddressDetails(addressIds: string[]): Promise<AddressDetailsDTO[]>;
}
