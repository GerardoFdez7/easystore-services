import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(RemoveManyItemsFromCartHandler.name);

  /**
   * Handles the RemoveManyItemsFromCart event by logging the multiple items removal
   * @param event - The RemoveManyItemsFromCart containing cart information and variant IDs
   */
  handle(event: RemoveManyItemsFromCart): void {
    const variantIds = event.variantsIds.map((id) => id.getValue()).join(', ');

    this.logger.log(
      `Multiple items removed from cart - Cart ID: ${event.cart.get('id').getValue()}, Variant IDs: [${variantIds}], Items count: ${event.variantsIds.length}`,
    );
  }
}
