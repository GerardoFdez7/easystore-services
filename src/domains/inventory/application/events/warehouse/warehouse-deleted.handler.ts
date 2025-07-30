import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { WarehouseDeletedEvent } from '../../../aggregates/events/warehouse/warehouse-deleted.event';

@Injectable()
@EventsHandler(WarehouseDeletedEvent)
export class WarehouseDeletedHandler
  implements IEventHandler<WarehouseDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: WarehouseDeletedEvent): void {
    this.logger.warn(
      `Warehouse deleted: ${event.warehouse.get('name').getValue()}`,
    );
  }
}
