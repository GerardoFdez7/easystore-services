import { IStockPerWarehouseBase } from '../../../aggregates/entities/stockPerWarehouse/stock-per-warehouse.attributes';

export class UpdateStockPerWarehouseDTO {
  constructor(
    public readonly id: string,
    public readonly warehouseId: string,
    public readonly updates: Partial<IStockPerWarehouseBase>,
  ) {}
}
