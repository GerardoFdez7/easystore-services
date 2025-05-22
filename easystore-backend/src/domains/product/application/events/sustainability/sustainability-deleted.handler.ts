import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { SustainabilityDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(SustainabilityDeletedEvent)
export class SustainabilityDeletedHandler
  implements IEventHandler<SustainabilityDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: SustainabilityDeletedEvent): void {
    const product = event.product;
    const deletedSustainability = event.deletedSustainability;

    this.logger.warn(
      `Sustainability deleted for product: ${product.get('name').getValue()} (ID: ${product.get('id').getValue()}), Sustainability ID: ${deletedSustainability.get('id').getValue()}`,
    );
  }
}
