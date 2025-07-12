import { IEvent } from '@nestjs/cqrs';
import { StockPerWarehouse } from '../../entities';
 
export class StockPerWarehouseUpdatedEvent implements IEvent {
  constructor(public readonly stockPerWarehouse: StockPerWarehouse) {}
} 