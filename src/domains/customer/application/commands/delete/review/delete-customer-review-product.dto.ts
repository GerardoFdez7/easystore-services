export class DeleteCustomerReviewProductDto {
  constructor(
    public readonly customerId: string,
    public readonly reviewId: string,
    public readonly tenantId: string,
  ) {}
}
