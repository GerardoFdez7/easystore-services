import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AddressCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AddressCreatedEvent)
export class AddressCreatedHandler
  implements IEventHandler<AddressCreatedEvent>
{
  handle(event: AddressCreatedEvent): void {
    logger.log(
      `Address created: ${event.address.get('name').getValue()}, with id: ${event.address.get('id').getValue()}`,
    );
  }
}
