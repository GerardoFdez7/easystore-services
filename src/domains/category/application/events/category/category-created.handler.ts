import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CategoryCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(CategoryCreatedEvent)
export class CategoryCreatedHandler
  implements IEventHandler<CategoryCreatedEvent>
{
  handle(event: CategoryCreatedEvent): void {
    logger.log(
      `Category created: ${event.category.get('name').getValue()}, with id: ${event.category.get('id').getValue()}`,
    );
  }
}
