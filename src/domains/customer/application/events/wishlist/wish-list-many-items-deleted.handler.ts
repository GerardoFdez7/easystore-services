import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WishlistManyItemsDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(WishlistManyItemsDeletedEvent)
export class WishlistManyItemsDeletedHandler
  implements IEventHandler<WishlistManyItemsDeletedEvent>
{
  handle(event: WishlistManyItemsDeletedEvent): void {
    const itemIds = event.wishlistItems
      .map((item) => item.getIdValue())
      .join(', ');
    logger.log(
      `Multiple wish list items deleted: [${itemIds}], with customer id: ${event.customer.get('id').getValue()}`,
    );
  }
}
