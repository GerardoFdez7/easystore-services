import { CustomerReviewProductPropsWithId } from 'src/domains/customer/aggregates/value-objects/customer-review-product.vo';

export class UpdateCustomerReviewProductDto {
  constructor(
    public readonly review: Partial<
      Pick<CustomerReviewProductPropsWithId, 'id' | 'ratingCount' | 'comment'>
    >,
    public readonly customerId: string,
    public readonly tenantId: string,
  ) {}
}
