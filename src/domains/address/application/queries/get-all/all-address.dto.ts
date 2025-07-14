import { AddressTypeEnum } from '../../../aggregates/value-objects';

export class GetAllAddressDTO {
  constructor(
    public readonly tenantId?: string,
    public readonly customerId?: string,
    public readonly options?: {
      addressType?: AddressTypeEnum;
    },
  ) {}
}
