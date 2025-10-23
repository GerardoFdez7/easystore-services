import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomerCreatedEvent } from 'src/domains/customer/aggregates/events';

@Injectable()
@EventsHandler(CustomerCreatedEvent)
export class CustomerCreatedHandler
  implements IEventHandler<CustomerCreatedEvent>
{
  handle(event: CustomerCreatedEvent): void {
    logger.log(
      `Customer created: ${event.customer.get('name').getValue()}, with id: ${event.customer.get('id').getValue()}`,
    );
  }
}
