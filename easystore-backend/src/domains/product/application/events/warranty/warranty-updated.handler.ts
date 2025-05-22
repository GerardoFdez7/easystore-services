import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { WarrantyUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(WarrantyUpdatedEvent)
export class WarrantyUpdatedHandler
  implements IEventHandler<WarrantyUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: WarrantyUpdatedEvent): void {
    this.logger.log(
      `Warranty updated for variant with id: ${event.variant.get('id').getValue()} Warranty ID: ${event.updatedWarranty.get('id').getValue()}`,
    );
  }
}
