import { ICustomerReviewCreated } from 'src/domains/customer/aggregates/entities';

export class CreateCustomerReviewProductDto {
  constructor(
    public readonly review: ICustomerReviewCreated,
    public readonly customerId: string,
    public readonly tenantId: string,
  ) {}
}
