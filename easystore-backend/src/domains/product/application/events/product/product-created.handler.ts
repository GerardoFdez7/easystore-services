import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/winston/winston.service';
import { ProductCreatedEvent } from '../../../aggregates/events/product/product-created.event';

@Injectable()
@EventsHandler(ProductCreatedEvent)
export class ProductCreatedHandler
  implements IEventHandler<ProductCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: ProductCreatedEvent): void {
    this.logger.log(`Product created: ${event.product.get('name').getValue()}`);
  }
}
