import { IStockPerWarehouseBase } from '../../../../aggregates/entities';

export class CreateStockPerWarehouseDTO {
  constructor(
    public readonly storeId: string,
    public readonly reason: string,
    public readonly createdById: string,
    public readonly data: IStockPerWarehouseBase,
  ) {}
}
