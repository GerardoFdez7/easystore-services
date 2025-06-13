export class GetProductsByNameDTO {
  constructor(
    public readonly name: string,
    public readonly tenantId: string,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly includeSoftDeleted?: boolean,
  ) {}
}
