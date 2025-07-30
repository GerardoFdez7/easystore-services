import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { StockPerWarehouseUpdatedInWarehouseEvent } from '../../../aggregates/events/stockPerWarehouse/stock-per-warehouse-updated-in-warehouse.event';

@Injectable()
@EventsHandler(StockPerWarehouseUpdatedInWarehouseEvent)
export class StockPerWarehouseUpdatedInWarehouseHandler
  implements IEventHandler<StockPerWarehouseUpdatedInWarehouseEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: StockPerWarehouseUpdatedInWarehouseEvent): void {
    this.logger.log(
      `StockPerWarehouse updated in warehouse: ${event.stockPerWarehouse.get('id').getValue()} -> ${event.warehouse.get('id').getValue()}`,
    );
  }
} 