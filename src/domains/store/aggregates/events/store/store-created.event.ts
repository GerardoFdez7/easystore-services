import { IEvent } from '@nestjs/cqrs';
import { Store } from '../../entities';

export class StoreCreatedEvent implements IEvent {
  constructor(public readonly store: Store) {}
}
