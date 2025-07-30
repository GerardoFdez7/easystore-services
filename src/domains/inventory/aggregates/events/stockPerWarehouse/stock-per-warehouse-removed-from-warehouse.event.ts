import { IEvent } from '@nestjs/cqrs';
import { StockPerWarehouse, Warehouse } from '../../entities';

export class StockPerWarehouseRemovedFromWarehouseEvent implements IEvent {
  constructor(
    public readonly stockPerWarehouse: StockPerWarehouse,
    public readonly warehouse: Warehouse,
  ) {}
} 