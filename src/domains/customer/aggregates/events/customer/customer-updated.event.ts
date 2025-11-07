import { Customer } from '../../entities';

export class CustomerUpdatedEvent {
  constructor(public readonly customer: Customer) {}
}
