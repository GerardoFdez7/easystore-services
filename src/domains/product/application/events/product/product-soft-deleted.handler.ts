import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ProductSoftDeletedEvent } from '../../../aggregates/events/product/product-soft-deleted.event';

@Injectable()
@EventsHandler(ProductSoftDeletedEvent)
export class ProductSoftDeletedHandler
  implements IEventHandler<ProductSoftDeletedEvent>
{
  handle(event: ProductSoftDeletedEvent): void {
    logger.log(
      `Product soft deleted: ${event.product.get('name').getValue()}, with id: ${event.product.get('id').getValue()}`,
    );
  }
}
