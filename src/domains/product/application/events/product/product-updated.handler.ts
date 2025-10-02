import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ProductUpdatedEvent } from '../../../aggregates/events/product/product-updated.event';

@Injectable()
@EventsHandler(ProductUpdatedEvent)
export class ProductUpdatedHandler
  implements IEventHandler<ProductUpdatedEvent>
{
  handle(event: ProductUpdatedEvent): void {
    logger.log(
      `Product updated: ${event.product.get('name').getValue()}, with id: ${event.product.get('id').getValue()}`,
    );
  }
}
