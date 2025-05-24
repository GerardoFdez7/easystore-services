export class SoftDeleteProductDTO {
  constructor(
    public readonly id: number,
    public readonly tenantId: number,
  ) {}
}
