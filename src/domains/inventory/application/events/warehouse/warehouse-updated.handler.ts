import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { WarehouseUpdatedEvent } from '../../../aggregates/events/warehouse/warehouse-updated.event';

@Injectable()
@EventsHandler(WarehouseUpdatedEvent)
export class WarehouseUpdatedHandler
  implements IEventHandler<WarehouseUpdatedEvent>
{
  handle(event: WarehouseUpdatedEvent): void {
    logger.log(
      `Warehouse updated: ${event.warehouse.get('name').getValue()} (ID: ${event.warehouse.get('id').getValue()})`,
    );
  }
}
