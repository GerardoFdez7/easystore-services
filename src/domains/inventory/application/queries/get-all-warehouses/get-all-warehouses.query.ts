export class GetAllWarehousesQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly name?: string,
    public readonly addressId?: string,
    public readonly sortBy?: string,
    public readonly sortOrder?: string,
  ) {}
}
