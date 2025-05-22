import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { SustainabilityUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(SustainabilityUpdatedEvent)
export class SustainabilityUpdatedHandler
  implements IEventHandler<SustainabilityUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: SustainabilityUpdatedEvent): void {
    const product = event.product;
    const updatedSustainability = event.updatedSustainability;

    this.logger.log(
      `Sustainability updated for product: ${product.get('name').getValue()} (ID: ${product.get('id').getValue()}), Sustainability ID: ${updatedSustainability.get('id').getValue()}`,
    );
  }
}
