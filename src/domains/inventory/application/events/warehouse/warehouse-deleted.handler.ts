import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { WarehouseDeletedEvent } from '../../../aggregates/events/warehouse/warehouse-deleted.event';

@Injectable()
@EventsHandler(WarehouseDeletedEvent)
export class WarehouseDeletedHandler
  implements IEventHandler<WarehouseDeletedEvent>
{
  handle(event: WarehouseDeletedEvent): void {
    logger.warn(
      `Warehouse deleted: ${event.warehouse.get('name').getValue()} (ID: ${event.warehouse.get('id').getValue()})`,
    );
  }
}
