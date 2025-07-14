import { AddressTypes } from '.prisma/postgres';

export class GetAllAddressDTO {
  constructor(
    public readonly tenantId?: string,
    public readonly customerId?: string,
    public readonly options?: {
      addressType?: AddressTypes;
    },
  ) {}
}
