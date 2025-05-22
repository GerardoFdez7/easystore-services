import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { VariantUpdatedEvent } from '../../../aggregates/events/variant/variant-updated.event';

@Injectable()
@EventsHandler(VariantUpdatedEvent)
export class VariantUpdatedHandler
  implements IEventHandler<VariantUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: VariantUpdatedEvent): void {
    const product = event.product;
    const updatedVariant = event.updatedVariant;

    this.logger.log(
      `Variant updated for product: ${product.get('name').getValue()} (ID: ${product.get('id').getValue()}), Variant ID: ${updatedVariant.get('id').getValue()}`,
    );
  }
}
