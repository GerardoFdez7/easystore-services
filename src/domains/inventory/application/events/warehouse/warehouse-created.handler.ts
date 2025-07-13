import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { WarehouseCreatedEvent } from '../../../aggregates/events/warehouse/warehouse-created.event';

@Injectable()
@EventsHandler(WarehouseCreatedEvent)
export class WarehouseCreatedHandler
  implements IEventHandler<WarehouseCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: WarehouseCreatedEvent): void {
    this.logger.log(`Warehouse created: ${event.warehouse.get('name').getValue()}`);
  }
} 