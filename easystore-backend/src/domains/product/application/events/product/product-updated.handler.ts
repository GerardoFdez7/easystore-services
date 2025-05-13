import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/winston/winston.service';
import { ProductUpdatedEvent } from '../../../aggregates/events/product/product-updated.event';

@Injectable()
@EventsHandler(ProductUpdatedEvent)
export class ProductUpdatedHandler
  implements IEventHandler<ProductUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: ProductUpdatedEvent): void {
    this.logger.log(
      `Product updated: ${event.product.get('name').getValue()}, with id: ${event.product.get('id').getValue()}`,
    );
  }
}
