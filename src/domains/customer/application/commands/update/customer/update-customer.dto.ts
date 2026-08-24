import { ICustomerUpdateBase } from '../../../../aggregates/entities';

export class UpdateCustomerDto {
  constructor(
    public readonly data: ICustomerUpdateBase,
    public readonly customerId: string,
    public readonly tenantId: string,
  ) {}
}
