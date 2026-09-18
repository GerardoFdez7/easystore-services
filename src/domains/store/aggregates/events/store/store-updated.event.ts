import { IEvent } from '@nestjs/cqrs';
import { Store } from '../../entities';

export class StoreUpdatedEvent implements IEvent {
  constructor(public readonly store: Store) {}
}
