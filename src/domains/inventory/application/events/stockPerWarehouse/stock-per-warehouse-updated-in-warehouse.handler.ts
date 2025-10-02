import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { StockPerWarehouseUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(StockPerWarehouseUpdatedEvent)
export class StockPerWarehouseUpdatedInWarehouseHandler
  implements IEventHandler<StockPerWarehouseUpdatedEvent>
{
  handle(event: StockPerWarehouseUpdatedEvent): void {
    logger.log(
      `Stock ${event.stockPerWarehouse.get('id').getValue()} updated in warehouse: ${event.warehouse.get('id').getValue()}`,
    );
  }
}
