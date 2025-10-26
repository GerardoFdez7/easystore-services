import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WishlistItemCreatedEvent } from 'src/domains/customer/aggregates/events';

@Injectable()
@EventsHandler(WishlistItemCreatedEvent)
export class WishlistItemCreatedHandler
  implements IEventHandler<WishlistItemCreatedEvent>
{
  handle(event: WishlistItemCreatedEvent): void {
    logger.log(
      `Wish list item created: ${event.wishlistItem.getIdValue()}, with customer id: ${event.customer.get('id').getValue()}`,
    );
  }
}
