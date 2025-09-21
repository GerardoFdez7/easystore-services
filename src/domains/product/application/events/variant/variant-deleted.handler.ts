import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@logger/winston.service';
import { VariantDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(VariantDeletedEvent)
export class VariantDeletedHandler
  implements IEventHandler<VariantDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: VariantDeletedEvent): void {
    const product = event.product;
    const deletedVariant = event.deletedVariant;

    this.logger.warn(
      `Variant deleted for product: ${product.get('name').getValue()} (ID: ${product.get('id').getValue()}), Variant ID: ${deletedVariant.get('id').getValue()}`,
    );
  }
}
