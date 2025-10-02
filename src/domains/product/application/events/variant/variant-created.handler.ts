import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { VariantCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(VariantCreatedEvent)
export class VariantCreatedHandler
  implements IEventHandler<VariantCreatedEvent>
{
  handle(event: VariantCreatedEvent): void {
    logger.log(
      `Variant created for Product: ${event.product.get('name').getValue()} (ID: ${event.product.get('id').getValue()}), Variant ID: ${event.craetedVariant.get('id').getValue()}`,
    );
  }
}
