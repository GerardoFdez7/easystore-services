export class SoftDeleteProductDTO {
  constructor(
    public readonly tenantId: number,
    public readonly id: number,
  ) {}
}
