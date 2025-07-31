import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { VariantCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(VariantCreatedEvent)
export class VariantCreatedHandler
  implements IEventHandler<VariantCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: VariantCreatedEvent): void {
    this.logger.log(
      `Variant created for Product: ${event.product.get('name').getValue()} (ID: ${event.product.get('id').getValue()}), Variant ID: ${event.craetedVariant.get('id').getValue()}`,
    );
  }
}
