import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@logger/winston.service';
import { VariantRestoredEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(VariantRestoredEvent)
export class VariantRestoredHandler
  implements IEventHandler<VariantRestoredEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: VariantRestoredEvent): void {
    const product = event.product;
    const restoredVariant = event.restoredVariant;

    this.logger.log(
      `Variant restored for product: ${product.get('name').getValue()} (ID: ${product.get('id').getValue()}), Variant ID: ${restoredVariant.get('id').getValue()}`,
    );
  }
}
