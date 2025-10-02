import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { VariantArchivedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(VariantArchivedEvent)
export class VariantArchivedHandler
  implements IEventHandler<VariantArchivedEvent>
{
  handle(event: VariantArchivedEvent): void {
    const product = event.product;
    const archivedVariant = event.archivedVariant;

    logger.log(
      `Variant archived for product: ${product.get('name').getValue()} (ID: ${product.get('id').getValue()}), Variant ID: ${archivedVariant.get('id').getValue()}`,
    );
  }
}
