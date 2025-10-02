import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AddressUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AddressUpdatedEvent)
export class AddressUpdatedHandler
  implements IEventHandler<AddressUpdatedEvent>
{
  handle(event: AddressUpdatedEvent): void {
    logger.log(
      `Address updated: ${event.address.get('name').getValue()}, with Id: ${event.address.get('id').getValue()}`,
    );
  }
}
