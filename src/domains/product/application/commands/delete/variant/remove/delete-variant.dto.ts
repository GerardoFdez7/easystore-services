export class DeleteVariantDTO {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly tenantId: number,
  ) {}
}
