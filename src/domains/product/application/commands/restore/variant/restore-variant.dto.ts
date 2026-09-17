export class RestoreVariantDTO {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly storeId: string,
  ) {}
}
