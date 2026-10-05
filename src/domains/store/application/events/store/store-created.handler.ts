import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { StoreCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(StoreCreatedEvent)
export class StoreCreatedHandler implements IEventHandler<StoreCreatedEvent> {
  handle(event: StoreCreatedEvent): void {
    logger.log(
      `Store created: ${event.store.get('name')?.getValue() ?? 'unnamed'}, with id: ${event.store.get('id').getValue()}`,
    );
  }
}
