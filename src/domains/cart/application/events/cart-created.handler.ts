import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CartCreatedEvent } from '../../aggregates/events/cart-created.event';

/**
 * Event handler for CartCreatedEvent
 * Logs when a new cart is created for a customer
 */
@Injectable()
@EventsHandler(CartCreatedEvent)
export class CartCreatedHandler implements IEventHandler<CartCreatedEvent> {
  /**
   * Handles the CartCreatedEvent by logging the cart creation
   * @param event - The CartCreatedEvent containing cart information
   */
  handle(event: CartCreatedEvent): void {
    logger.log(
      `Cart created with id: ${event.cart.get('id').getValue()}, to customer with id: ${event.cart.get('customerId').getValue()}`,
    );
  }
}
