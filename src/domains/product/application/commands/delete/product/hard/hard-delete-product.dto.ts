export class HardDeleteProductDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
