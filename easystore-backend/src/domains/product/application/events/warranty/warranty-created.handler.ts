import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { WarrantyCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(WarrantyCreatedEvent)
export class WarrantyCreatedHandler
  implements IEventHandler<WarrantyCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: WarrantyCreatedEvent): void {
    this.logger.log(
      `Warranty created for variant with id: ${event.variant.get('id').getValue()} Warranty ID: ${event.warrantyCreated.get('id').getValue()}`,
    );
  }
}
