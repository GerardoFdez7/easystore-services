import { ICustomerReviewUpdateBase } from '../../../../aggregates/entities';

export class UpdateCustomerReviewProductDto {
  constructor(
    public readonly review: ICustomerReviewUpdateBase,
    public readonly customerId: string,
    public readonly tenantId: string,
  ) {}
}
