export class RestoreProductDTO {
  constructor(
    public readonly id: number,
    public readonly tenantId: number,
  ) {}
}
