import { AddressTypes } from '.prisma/postgres';

export class GetAllAddressDTO {
  constructor(
    public readonly addressType: AddressTypes,
    public readonly tenantId?: string,
    public readonly customerId?: string,
  ) {}
}
