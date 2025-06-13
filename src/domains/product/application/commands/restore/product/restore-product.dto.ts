export class RestoreProductDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
