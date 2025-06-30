import { IEvent } from '@nestjs/cqrs';
import { Address } from '../../entities';

export class AddressUpdatedEvent implements IEvent {
  constructor(public readonly address: Address) {}
}
