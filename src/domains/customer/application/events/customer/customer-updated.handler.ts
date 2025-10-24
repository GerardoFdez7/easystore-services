import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomerUpdatedEvent } from 'src/domains/customer/aggregates/events';

@Injectable()
@EventsHandler(CustomerUpdatedEvent)
export class CustomerUpdatedHandler
  implements IEventHandler<CustomerUpdatedEvent>
{
  handle(event: CustomerUpdatedEvent): void {
    logger.log(
      `Customer updated: ${event.customer.get('name').getValue()}, with id: ${event.customer.get('id').getValue()}`,
    );
  }
}
