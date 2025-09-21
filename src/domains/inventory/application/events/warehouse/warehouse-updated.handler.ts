import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@logger/winston.service';
import { WarehouseUpdatedEvent } from '../../../aggregates/events/warehouse/warehouse-updated.event';

@Injectable()
@EventsHandler(WarehouseUpdatedEvent)
export class WarehouseUpdatedHandler
  implements IEventHandler<WarehouseUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: WarehouseUpdatedEvent): void {
    this.logger.log(
      `Warehouse updated: ${event.warehouse.get('name').getValue()} (ID: ${event.warehouse.get('id').getValue()})`,
    );
  }
}
