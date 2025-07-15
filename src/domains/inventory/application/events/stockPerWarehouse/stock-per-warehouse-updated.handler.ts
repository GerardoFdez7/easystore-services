import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { StockPerWarehouseUpdatedEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-updated.event';

@Injectable()
@EventsHandler(StockPerWarehouseUpdatedEvent)
export class StockPerWarehouseUpdatedHandler
  implements IEventHandler<StockPerWarehouseUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: StockPerWarehouseUpdatedEvent): void {
    this.logger.log(`StockPerWarehouse updated: ${event.stockPerWarehouse.get('id').getValue()}`);
  }
} 