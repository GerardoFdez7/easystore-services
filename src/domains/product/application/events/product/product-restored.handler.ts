import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { ProductRestoredEvent } from '../../../aggregates/events/product/product-restored.event';

@Injectable()
@EventsHandler(ProductRestoredEvent)
export class ProductRestoredHandler
  implements IEventHandler<ProductRestoredEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: ProductRestoredEvent): void {
    this.logger.log(
      `Product restored: ${event.product.get('name').getValue()}, with id: ${event.product.get('id').getValue()}`,
    );
  }
}
