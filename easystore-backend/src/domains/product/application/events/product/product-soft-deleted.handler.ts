import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/winston/winston.service';
import { ProductSoftDeletedEvent } from '../../../aggregates/events/product/product-soft-deleted.event';

@Injectable()
@EventsHandler(ProductSoftDeletedEvent)
export class ProductSoftDeletedHandler
  implements IEventHandler<ProductSoftDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: ProductSoftDeletedEvent): void {
    this.logger.log(
      `Product soft deleted: ${event.product.get('name').getValue()}, with id: ${event.product.get('id').getValue()}`,
    );
  }
}
