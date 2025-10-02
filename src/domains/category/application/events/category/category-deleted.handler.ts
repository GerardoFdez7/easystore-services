import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CategoryDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(CategoryDeletedEvent)
export class CategoryDeletedHandler
  implements IEventHandler<CategoryDeletedEvent>
{
  handle(event: CategoryDeletedEvent): void {
    logger.warn(
      `Category deleted: ${event.category.get('name').getValue()}, with id: ${event.category.get('id').getValue()}`,
    );
  }
}
