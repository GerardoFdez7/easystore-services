import { IStockPerWarehouseBase } from '../../../../aggregates/entities';

export class CreateStockPerWarehouseDTO {
  constructor(
    public readonly warehouseId: string,
    public readonly tenantId: string,
    public readonly data: IStockPerWarehouseBase,
  ) {}
}
