import { IEvent } from '@nestjs/cqrs';
import { Customer } from '../../entities';

export class CustomerUpdatedEvent implements IEvent {
  constructor(public readonly customer: Customer) {}
}
