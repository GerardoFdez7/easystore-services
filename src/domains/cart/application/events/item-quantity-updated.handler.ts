import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ItemQuantityUpdatedEvent } from '../../aggregates/events/item-quantity-updated.event';

/**
 * Event handler for ItemQuantityUpdatedEvent
 * Logs when an item quantity is updated in a cart
 */
@Injectable()
@EventsHandler(ItemQuantityUpdatedEvent)
export class ItemQuantityUpdatedHandler
  implements IEventHandler<ItemQuantityUpdatedEvent>
{
  /**
   * Handles the ItemQuantityUpdatedEvent by logging the quantity update
   * @param event - The ItemQuantityUpdatedEvent containing cart information
   */
  handle(event: ItemQuantityUpdatedEvent): void {
    logger.log(
      `Item quantity updated - Variant ID: ${event.item.getVariantIdValue()}, Cart ID: ${event.cart.get('id').getValue()}, New quantity: ${event.item.getQty().getValue()}`,
    );
  }
}
