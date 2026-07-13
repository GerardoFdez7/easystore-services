export class DeleteManyWishListDto {
  constructor(
    public readonly customerId: string,
    public readonly variantIds: string[],
    public readonly tenantId: string,
  ) {}
}
