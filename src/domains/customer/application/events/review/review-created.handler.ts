import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomerReviewProductCreatedEvent } from 'src/domains/customer/aggregates/events';

@Injectable()
@EventsHandler(CustomerReviewProductCreatedEvent)
export class CustomerReviewProductCreatedHandler
  implements IEventHandler<CustomerReviewProductCreatedEvent>
{
  handle(event: CustomerReviewProductCreatedEvent): void {
    logger.log(
      `Review created: ${event.review.getIdValue()}, with customer id: ${event.customer.get('id').getValue()}`,
    );
  }
}
