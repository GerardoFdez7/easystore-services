import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ProductRestoredEvent } from '../../../aggregates/events/product/product-restored.event';

@Injectable()
@EventsHandler(ProductRestoredEvent)
export class ProductRestoredHandler
  implements IEventHandler<ProductRestoredEvent>
{
  handle(event: ProductRestoredEvent): void {
    logger.log(
      `Product restored: ${event.product.get('name').getValue()}, with id: ${event.product.get('id').getValue()}`,
    );
  }
}
