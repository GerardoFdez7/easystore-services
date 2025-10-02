import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ProductHardDeletedEvent } from '../../../aggregates/events/product/product-hard-deleted.event';

@Injectable()
@EventsHandler(ProductHardDeletedEvent)
export class ProductHardDeletedHandler
  implements IEventHandler<ProductHardDeletedEvent>
{
  handle(event: ProductHardDeletedEvent): void {
    logger.warn(
      `Product hard deleted: ${event.product.get('name').getValue()}, with id: ${event.product.get('id').getValue()}`,
    );
  }
}
