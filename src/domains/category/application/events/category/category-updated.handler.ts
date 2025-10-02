import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CategoryUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(CategoryUpdatedEvent)
export class CategoryUpdatedHandler
  implements IEventHandler<CategoryUpdatedEvent>
{
  handle(event: CategoryUpdatedEvent): void {
    logger.log(
      `Category updated: ${event.category.get('name').getValue()}, with id: ${event.category.get('id').getValue()}`,
    );
  }
}
