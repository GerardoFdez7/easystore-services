export class GetWarehouseByIdQuery {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
  ) {}
}
