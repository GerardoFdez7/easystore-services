import { ICustomerReviewBase } from '../../../../aggregates/entities';

export class CreateCustomerReviewProductDto {
  constructor(
    public readonly review: ICustomerReviewBase,
    public readonly customerId: string,
    public readonly tenantId: string,
  ) {}
}
