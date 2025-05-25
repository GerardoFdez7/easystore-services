export class GetProductsByNameDTO {
  constructor(
    public readonly name: string,
    public readonly tenantId: number,
    public readonly includeSoftDeleted?: boolean,
  ) {}
}
