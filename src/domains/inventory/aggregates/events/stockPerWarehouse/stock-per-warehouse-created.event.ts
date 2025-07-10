import { IEvent } from '@nestjs/cqrs';
import { StockPerWarehouse } from '../../entities';

export class StockPerWarehouseCreatedEvent implements IEvent {
  constructor(public readonly stockPerWarehouse: StockPerWarehouse) {}
} 