import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/winston/winston.service';
import { VariantUpdatedEvent } from '../../../aggregates/events/product-variant/variant-updated.event';

@Injectable()
@EventsHandler(VariantUpdatedEvent)
export class VariantUpdatedHandler
  implements IEventHandler<VariantUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: VariantUpdatedEvent): void {
    const product = event.product;
    const updatedVariant = event.updatedVariant;

    // Get the first attribute of the variant for logging
    const attributes = updatedVariant.getAttributes();
    if (attributes && attributes.length > 0) {
      const attribute = attributes[0];
      this.logger.log(
        `Variant of the product ${product.get('name').getValue()} has been updated: ${attribute.getKey()}, ${attribute.getValue()}`,
      );
    } else {
      this.logger.log(
        `Variant of the product ${product.get('name').getValue()} has been updated (no attributes)`,
      );
    }
  }
}
