import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { StockPerWarehouseDeletedEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-deleted.event';

@Injectable()
@EventsHandler(StockPerWarehouseDeletedEvent)
export class StockPerWarehouseDeletedHandler
  implements IEventHandler<StockPerWarehouseDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: StockPerWarehouseDeletedEvent): void {
    this.logger.warn(
      `StockPerWarehouse deleted: ${event.stockPerWarehouse.get('id').getValue()}`,
    );
  }
}
