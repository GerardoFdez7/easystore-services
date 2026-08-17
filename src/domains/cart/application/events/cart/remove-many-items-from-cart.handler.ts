import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { RemoveManyItemsFromCartEvent } from '../../../aggregates/events/cart/remove-many-items.event';

/**
 * Event handler for RemoveManyItemsFromCartEvent
 * Logs when multiple items are removed from a cart
 */
@Injectable()
@EventsHandler(RemoveManyItemsFromCartEvent)
export class RemoveManyItemsFromCartHandler
  implements IEventHandler<RemoveManyItemsFromCartEvent>
{
  /**
   * Handles the RemoveManyItemsFromCartEvent by logging the multiple items removal
   * @param event - The RemoveManyItemsFromCartEvent containing cart information and variant IDs
   */
  handle(event: RemoveManyItemsFromCartEvent): void {
    const variantIds = event.variantsIds.map((id) => id.getValue()).join(', ');

    logger.log(
      `Multiple items removed from cart - Cart ID: ${event.cart.get('id').getValue()}, Variant IDs: [${variantIds}], Items count: ${event.variantsIds.length}`,
    );
  }
}
