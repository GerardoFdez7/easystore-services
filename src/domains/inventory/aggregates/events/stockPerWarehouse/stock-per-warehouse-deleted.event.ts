import { IEvent } from '@nestjs/cqrs';
import { StockPerWarehouse } from '../../entities';

export class StockPerWarehouseDeletedEvent implements IEvent {
  constructor(public readonly stockPerWarehouse: StockPerWarehouse) {}
} 