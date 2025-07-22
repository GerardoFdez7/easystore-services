export class DeleteStockPerWarehouseDTO {
  constructor(
    public readonly id: string,
    public readonly warehouseId: string,
  ) {}
}
