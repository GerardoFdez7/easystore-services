import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { SustainabilityCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(SustainabilityCreatedEvent)
export class SustainabilityCreatedHandler
  implements IEventHandler<SustainabilityCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: SustainabilityCreatedEvent): void {
    this.logger.log(
      `Sustainability created for product: ${event.product.get('name').getValue()} (ID: ${event.product.get('id').getValue()}), Sustainability ID: ${event.sustainabilityCreated.get('id').getValue()}`,
    );
  }
}
