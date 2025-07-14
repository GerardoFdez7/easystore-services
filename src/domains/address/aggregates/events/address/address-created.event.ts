import { IEvent } from '@nestjs/cqrs';
import { Address } from '../../entities';

export class AddressCreatedEvent implements IEvent {
  constructor(public readonly address: Address) {}
}
