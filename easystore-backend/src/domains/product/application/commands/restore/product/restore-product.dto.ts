export class RestoreProductDTO {
  constructor(
    public readonly tenantId: number,
    public readonly id: number,
  ) {}
}
