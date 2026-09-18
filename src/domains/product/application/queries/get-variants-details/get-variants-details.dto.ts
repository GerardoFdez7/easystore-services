export class GetVariantsDetailsDTO {
  constructor(
    public readonly variantIds: string[],
    public readonly storeId: string,
    public readonly search?: string,
  ) {}
}
