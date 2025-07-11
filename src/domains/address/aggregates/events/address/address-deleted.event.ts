import { IEvent } from '@nestjs/cqrs';
import { Address } from '../../entities';

export class AddressDeletedEvent implements IEvent {
  constructor(public readonly address: Address) {}
}
