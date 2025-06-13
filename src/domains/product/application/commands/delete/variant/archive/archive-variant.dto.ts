export class ArchiveVariantDTO {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly tenantId: string,
  ) {}
}
