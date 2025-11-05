import { IEvent } from '@nestjs/cqrs';
import { Customer } from '../../entities';

/**
 * Event representing a customer creation from external domain
 * This event is used by the cart domain to react to customer creation
 * and automatically create a cart for the new customer
 */
export class CustomerCreatedEvent implements IEvent {
  constructor(public readonly customer: Customer) {}
}
