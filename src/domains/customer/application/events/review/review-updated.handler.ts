import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomerReviewProductUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(CustomerReviewProductUpdatedEvent)
export class CustomerReviewProductUpdatedHandler
  implements IEventHandler<CustomerReviewProductUpdatedEvent>
{
  handle(event: CustomerReviewProductUpdatedEvent): void {
    logger.log(
      `Review updated: ${event.review.getIdValue()}, with customer id: ${event.customer.get('id').getValue()}`,
    );
  }
}
