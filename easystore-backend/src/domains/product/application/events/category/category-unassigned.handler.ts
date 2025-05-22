import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { CategoryUnassignedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(CategoryUnassignedEvent)
export class CategoryUnassignedHandler
  implements IEventHandler<CategoryUnassignedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: CategoryUnassignedEvent): void {
    const product = event.product;
    const unassignedCategory = event.unassignedCategory;

    this.logger.warn(
      `Category unassigned for product: ${product.get('name').getValue()} (ID: ${product.get('id').getValue()}), Category ID: ${unassignedCategory.get('id').getValue()}`,
    );
  }
}
