import { IAddressType } from '../../../aggregates/entities';

export type AddressDTO = IAddressType;

export interface AllAddressDTO {
  addresses: AddressDTO[];
  total: number;
  hasMore: boolean;
}
