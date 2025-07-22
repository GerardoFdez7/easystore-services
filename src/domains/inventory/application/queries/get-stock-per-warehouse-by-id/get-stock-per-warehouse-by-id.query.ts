export class GetStockPerWarehouseByIdQuery {
  constructor(
    public readonly id: string,
    public readonly warehouseId: string,
  ) {}
}
