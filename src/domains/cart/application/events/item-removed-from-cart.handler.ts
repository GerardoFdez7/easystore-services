import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ItemRemovedFromCartEvent } from '../../aggregates/events/remove-item-cart.event';

/**
 * Event handler for ItemRemovedFromCartEvent
 * Logs when an item is removed from a cart
 */
@Injectable()
@EventsHandler(ItemRemovedFromCartEvent)
export class ItemRemovedFromCartHandler
  implements IEventHandler<ItemRemovedFromCartEvent>
{
  /**
   * Handles the ItemRemovedFromCartEvent by logging the item removal
   * @param event - The ItemRemovedFromCartEvent containing cart information
   */
  handle(event: ItemRemovedFromCartEvent): void {
    logger.log(
      `Item removed from cart with variant id: ${event.item.getVariantIdValue()}, cart id: ${event.cart.get('id').getValue()}`,
    );
  }
}
