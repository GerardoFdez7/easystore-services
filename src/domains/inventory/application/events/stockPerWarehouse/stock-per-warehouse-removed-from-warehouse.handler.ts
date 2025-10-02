import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { StockPerWarehouseRemovedEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-removed.event';

@Injectable()
@EventsHandler(StockPerWarehouseRemovedEvent)
export class StockPerWarehouseRemovedFromWarehouseHandler
  implements IEventHandler<StockPerWarehouseRemovedEvent>
{
  handle(event: StockPerWarehouseRemovedEvent): void {
    logger.warn(
      `Stock ${event.stockPerWarehouse.get('id').getValue()} removed from warehouse: ${event.warehouse.get('id').getValue()}`,
    );
  }
}
