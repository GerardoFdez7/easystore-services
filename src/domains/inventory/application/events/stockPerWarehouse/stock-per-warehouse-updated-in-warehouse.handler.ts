import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { StockPerWarehouseUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(StockPerWarehouseUpdatedEvent)
export class StockPerWarehouseUpdatedInWarehouseHandler
  implements IEventHandler<StockPerWarehouseUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: StockPerWarehouseUpdatedEvent): void {
    this.logger.log(
      `Stock ${event.stockPerWarehouse.get('id').getValue()} updated in warehouse: ${event.warehouse.get('id').getValue()}`,
    );
  }
}
