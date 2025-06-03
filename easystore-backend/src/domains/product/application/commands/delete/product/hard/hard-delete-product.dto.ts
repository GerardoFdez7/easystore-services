export class HardDeleteProductDTO {
  constructor(
    public readonly tenantId: number,
    public readonly id: number,
  ) {}
}
