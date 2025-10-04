export class GetVariantsDetailsDTO {
  constructor(
    public readonly variantIds: string[],
    public readonly search?: string,
  ) {}
}
