import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { CategoryUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(CategoryUpdatedEvent)
export class CategoryUpdatedHandler
  implements IEventHandler<CategoryUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: CategoryUpdatedEvent): void {
    this.logger.log(
      `Category updated: ${event.category.get('name').getValue()}, with id: ${event.category.get('id').getValue()}`,
    );
  }
}
