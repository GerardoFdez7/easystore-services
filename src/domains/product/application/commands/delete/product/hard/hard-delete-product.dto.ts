export class HardDeleteProductDTO {
  constructor(
    public readonly id: number,
    public readonly tenantId: number,
  ) {}
}
