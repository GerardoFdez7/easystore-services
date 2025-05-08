import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shared/winston/winston.service';
import { ProductHardDeletedEvent } from '../../../aggregates/events/product/product-hard-deleted.event';

@Injectable()
@EventsHandler(ProductHardDeletedEvent)
export class ProductHardDeletedHandler
  implements IEventHandler<ProductHardDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: ProductHardDeletedEvent): void {
    this.logger.warn(
      `Product hard deleted: ${event.product.get('name').getValue()}`,
    );
  }
}
