import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { RemoveManyItemsFromCart } from '../../aggregates/events/remove-many-items.event';

/**
 * Event handler for RemoveManyItemsFromCart
 * Logs when multiple items are removed from a cart
 */
@Injectable()
@EventsHandler(RemoveManyItemsFromCart)
export class RemoveManyItemsFromCartHandler
  implements IEventHandler<RemoveManyItemsFromCart>
{
  /**
   * Handles the RemoveManyItemsFromCart event by logging the multiple items removal
   * @param event - The RemoveManyItemsFromCart containing cart information
   */
  handle(event: RemoveManyItemsFromCart): void {
    logger.log(
      `Multiple items removed from cart for customer: ${event.cart.get('customerId').getValue()}, cart id: ${event.cart.get('id').getValue()}`,
    );
  }
}
