export class DeleteWishListDto {
  constructor(
    public readonly customerId: string,
    public readonly variantId: string,
    public readonly tenantId: string,
  ) {}
}
