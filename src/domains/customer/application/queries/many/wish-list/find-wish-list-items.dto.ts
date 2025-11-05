export class FindWishlistItemsDto {
  constructor(
    public readonly customerId: string,
    public readonly variantsIds: string[] = [],
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
