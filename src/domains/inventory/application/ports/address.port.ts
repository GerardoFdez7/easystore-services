import { AddressDetailsDTO } from '@shared/application/dtos/address-details.dto';

/**
 * Address-query capability required by the Inventory application layer.
 */
export interface IAddressAdapter {
  getAddressDetails(
    addressIds: string[],
    tenantId: string,
  ): Promise<AddressDetailsDTO[]>;
}
