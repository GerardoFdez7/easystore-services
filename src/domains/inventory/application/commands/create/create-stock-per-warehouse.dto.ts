import { IStockPerWarehouseBase } from '../../../aggregates/entities';

export class CreateStockPerWarehouseDTO {
  constructor(
    public readonly data: IStockPerWarehouseBase & { tenantId: string },
  ) {}
}
