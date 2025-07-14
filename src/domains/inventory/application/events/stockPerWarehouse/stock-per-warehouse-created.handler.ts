import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { StockPerWarehouseCreatedEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-created.event';

@Injectable()
@EventsHandler(StockPerWarehouseCreatedEvent)
export class StockPerWarehouseCreatedHandler
  implements IEventHandler<StockPerWarehouseCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: StockPerWarehouseCreatedEvent): void {
    this.logger.log(`Stock per warehouse created: ${event.stockPerWarehouse.get('id').getValue()}`);
  }
} 