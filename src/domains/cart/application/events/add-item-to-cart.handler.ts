import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AddItemToCartEvent } from '../../aggregates/events/add-item-to-cart.event';

/**
 * Event handler for AddItemToCartEvent
 * Logs when an item is added to a cart
 */
@Injectable()
@EventsHandler(AddItemToCartEvent)
export class AddItemToCartHandler implements IEventHandler<AddItemToCartEvent> {
  /**
   * Handles the AddItemToCartEvent by logging the item addition
   * @param event - The AddItemToCartEvent containing cart and item information
   */
  handle(event: AddItemToCartEvent): void {
    logger.log(
      `Item added to cart for customer: ${event.cart.get('customerId').getValue()}, cart id: ${event.cart.get('id').getValue()}`,
    );
  }
}
