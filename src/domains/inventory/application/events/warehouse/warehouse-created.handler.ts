import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { WarehouseCreatedEvent } from '../../../aggregates/events/warehouse/warehouse-created.event';

@Injectable()
@EventsHandler(WarehouseCreatedEvent)
export class WarehouseCreatedHandler
  implements IEventHandler<WarehouseCreatedEvent>
{
  handle(event: WarehouseCreatedEvent): void {
    logger.log(
      `Warehouse created: ${event.warehouse.get('name').getValue()} (ID: ${event.warehouse.get('id').getValue()})`,
    );
  }
}
