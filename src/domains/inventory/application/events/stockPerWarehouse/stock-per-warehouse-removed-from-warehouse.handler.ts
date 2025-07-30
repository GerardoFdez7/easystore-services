import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { StockPerWarehouseRemovedFromWarehouseEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-removed-from-warehouse.event';

@Injectable()
@EventsHandler(StockPerWarehouseRemovedFromWarehouseEvent)
export class StockPerWarehouseRemovedFromWarehouseHandler
  implements IEventHandler<StockPerWarehouseRemovedFromWarehouseEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: StockPerWarehouseRemovedFromWarehouseEvent): void {
    this.logger.warn(
      `StockPerWarehouse removed from warehouse: ${event.stockPerWarehouse.get('id').getValue()} -> ${event.warehouse.get('id').getValue()}`,
    );
  }
}
