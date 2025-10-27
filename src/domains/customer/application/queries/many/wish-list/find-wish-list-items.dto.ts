export class FindWishlistItemsDto {
  constructor(
    public readonly customerId: string,
    public readonly variantsIds: string[] = [],
    public readonly page: number = 1,
    public readonly limit: number = 25,
  ) {}
}
