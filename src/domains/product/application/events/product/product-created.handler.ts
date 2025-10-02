import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ProductCreatedEvent } from '../../../aggregates/events/product/product-created.event';

@Injectable()
@EventsHandler(ProductCreatedEvent)
export class ProductCreatedHandler
  implements IEventHandler<ProductCreatedEvent>
{
  handle(event: ProductCreatedEvent): void {
    logger.log(
      `Product created: ${event.product.get('name').getValue()}, with id: ${event.product.get('id').getValue()}`,
    );
  }
}
