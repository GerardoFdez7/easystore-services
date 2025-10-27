import { ICustomerCreate } from 'src/domains/customer/aggregates/entities';

export class UpdateCustomerDto {
  constructor(
    public readonly data: Partial<
      Omit<ICustomerCreate, 'tenantId' | 'authIdentityId'>
    >,
    public readonly customerId: string,
    public readonly tenantId: string,
  ) {}
}
