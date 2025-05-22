import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { CategoryAssignedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(CategoryAssignedEvent)
export class CategoryAssignedHandler
  implements IEventHandler<CategoryAssignedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: CategoryAssignedEvent): void {
    this.logger.log(
      `Category assigned to product: ${event.product.get('name').getValue()} (ID: ${event.product.get('id').getValue()}), Category ID: ${event.assignedCategory.get('id').getValue()}`,
    );
  }
}
