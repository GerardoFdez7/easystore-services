export class SoftDeleteProductDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
