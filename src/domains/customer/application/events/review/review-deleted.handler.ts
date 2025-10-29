import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomerReviewProductDeletedEvent } from 'src/domains/customer/aggregates/events';

@Injectable()
@EventsHandler(CustomerReviewProductDeletedEvent)
export class CustomerReviewProductDeletedHandler
  implements IEventHandler<CustomerReviewProductDeletedEvent>
{
  handle(event: CustomerReviewProductDeletedEvent): void {
    logger.log(
      `Review deleted: ${event.review.getIdValue()}, with customer id: ${event.customer.get('id').getValue()}`,
    );
  }
}
