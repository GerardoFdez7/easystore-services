import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WishlistItemDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(WishlistItemDeletedEvent)
export class WishlistItemDeletedHandler
  implements IEventHandler<WishlistItemDeletedEvent>
{
  handle(event: WishlistItemDeletedEvent): void {
    logger.log(
      `Wish list item deleted: ${event.wishlistItem.getIdValue()}, with customer id: ${event.customer.get('id').getValue()}`,
    );
  }
}
