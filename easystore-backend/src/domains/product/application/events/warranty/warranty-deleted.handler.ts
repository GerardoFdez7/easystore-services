import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { WarrantyDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(WarrantyDeletedEvent)
export class WarrantyDeletedHandler
  implements IEventHandler<WarrantyDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: WarrantyDeletedEvent): void {
    this.logger.warn(
      `Warranty deleted for variant with id: ${event.variant.get('id').getValue()} Warranty ID: ${event.deletedWarranty.get('id').getValue()}`,
    );
  }
}
