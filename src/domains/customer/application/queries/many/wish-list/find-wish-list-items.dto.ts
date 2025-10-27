export class FindWishlistItemsDto {
  constructor(
    public readonly customerId: string,
    public readonly variantsIds: string[],
  ) {}
}
