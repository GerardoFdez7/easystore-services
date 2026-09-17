export class DeleteStockPerWarehouseDTO {
  constructor(
    public readonly stockId: string,
    public readonly warehouseId: string,
    public readonly storeId: string,
    public readonly reason: string,
    public readonly createdById: string,
  ) {}
}
