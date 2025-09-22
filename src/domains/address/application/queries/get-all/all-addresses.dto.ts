import { AddressTypeEnum } from '../../../aggregates/value-objects';

export class GetAllAddressesDTO {
  constructor(
    public readonly tenantId?: string,
    public readonly customerId?: string,
    public readonly options?: {
      page?: number;
      limit?: number;
      name?: string;
      addressType?: AddressTypeEnum;
    },
  ) {}
}
