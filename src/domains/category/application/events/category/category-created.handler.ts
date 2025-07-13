import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { CategoryCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(CategoryCreatedEvent)
export class CategoryCreatedHandler
  implements IEventHandler<CategoryCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: CategoryCreatedEvent): void {
    this.logger.log(
      `Category created: ${event.category.get('name').getValue()}, with id: ${event.category.get('id').getValue()}`,
    );
  }
}
