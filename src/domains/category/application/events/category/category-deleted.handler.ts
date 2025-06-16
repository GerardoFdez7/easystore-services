import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { CategoryDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(CategoryDeletedEvent)
export class CategoryDeletedHandler
  implements IEventHandler<CategoryDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: CategoryDeletedEvent): void {
    this.logger.warn(
      `Category deleted: ${event.category.get('name').getValue()}, with id: ${event.category.get('id').getValue()}`,
    );
  }
}
