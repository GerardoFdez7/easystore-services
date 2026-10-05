import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { StoreUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(StoreUpdatedEvent)
export class StoreUpdatedHandler implements IEventHandler<StoreUpdatedEvent> {
  handle(event: StoreUpdatedEvent): void {
    logger.log(
      `Store updated: ${event.store.get('name')?.getValue() ?? 'unnamed'}, with id: ${event.store.get('id').getValue()}`,
    );
  }
}
