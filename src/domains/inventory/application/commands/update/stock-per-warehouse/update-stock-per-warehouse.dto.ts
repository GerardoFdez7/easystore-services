import { IStockPerWarehouseBase } from '../../../../aggregates/entities';

export class UpdateStockPerWarehouseDTO {
  constructor(
    public readonly stockId: string,
    public readonly warehouseId: string,
    public readonly tenantId: string,
    public readonly data: Partial<
      Omit<IStockPerWarehouseBase, 'variantId' | 'warehouseId'>
    >,
    public readonly reason: string,
    public readonly createdById: string,
  ) {}
}
