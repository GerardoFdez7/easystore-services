import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { StockPerWarehouseAddedEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-added.event';

@Injectable()
@EventsHandler(StockPerWarehouseAddedEvent)
export class StockPerWarehouseAddedHandler
  implements IEventHandler<StockPerWarehouseAddedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: StockPerWarehouseAddedEvent): void {
    this.logger.log(
      `StockPerWarehouse added to warehouse: ${event.stockPerWarehouse.get('id').getValue()} -> ${event.warehouse.get('id').getValue()}`,
    );
  }
}
