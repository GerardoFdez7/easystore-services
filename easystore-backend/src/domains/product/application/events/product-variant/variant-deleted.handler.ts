import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/winston/winston.service';
import { VariantDeletedEvent } from '../../../aggregates/events/product-variant/variant-deleted.event';

@Injectable()
@EventsHandler(VariantDeletedEvent)
export class VariantDeletedHandler
  implements IEventHandler<VariantDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: VariantDeletedEvent): void {
    const product = event.product;

    // The deleted variant should be passed in the event
    const deletedVariant = event.deletedVariant;

    if (deletedVariant) {
      const attributes = deletedVariant.getAttributes();
      if (attributes && attributes.length > 0) {
        const attribute = attributes[0];
        this.logger.warn(
          `Variant of the product ${product.get('name').getValue()} has been deleted: ${attribute.getKey()}, ${attribute.getValue()}`,
        );
      } else {
        this.logger.warn(
          `Variant of the product ${product.get('name').getValue()} has been deleted (no attributes)`,
        );
      }
    } else {
      this.logger.warn(
        `Variant of the product ${product.get('name').getValue()} has been deleted (variant details not available)`,
      );
    }
  }
}
