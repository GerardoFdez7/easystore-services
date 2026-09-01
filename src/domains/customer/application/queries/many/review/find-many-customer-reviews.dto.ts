export class FindManyCustomerReviewsDto {
  constructor(
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly reviewIds?: string[],
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
