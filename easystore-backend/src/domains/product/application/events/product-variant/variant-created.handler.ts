import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/winston/winston.service';
import { VariantCreatedEvent } from '../../../aggregates/events/product-variant/variant-created.event';

@Injectable()
@EventsHandler(VariantCreatedEvent)
export class VariantCreatedHandler
  implements IEventHandler<VariantCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: VariantCreatedEvent): void {
    const product = event.product;
    const variants = product.get('variants');
    const newVariant = variants[variants.length - 1];

    // Get the first attribute of the variant for logging
    const attributes = newVariant.getAttributes();
    if (attributes && attributes.length > 0) {
      const attribute = attributes[0];
      this.logger.log(
        `Variant of the product ${product.get('name').getValue()} has been created: ${attribute.getKey()}, ${attribute.getValue()}`,
      );
    } else {
      this.logger.log(
        `Variant of the product ${product.get('name').getValue()} has been created (no attributes)`,
      );
    }
  }
}
