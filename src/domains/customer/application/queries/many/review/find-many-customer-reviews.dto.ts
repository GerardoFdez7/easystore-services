export class FindManyCustomerReviewsDto {
  constructor(
    public readonly customerId: string,
    public readonly reviewIds?: string[],
    public readonly page: number = 1,
    public readonly limit: number = 25,
  ) {}
}
