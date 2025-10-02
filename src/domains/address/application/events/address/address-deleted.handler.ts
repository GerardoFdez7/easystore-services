import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AddressDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AddressDeletedEvent)
export class AddressDeletedHandler
  implements IEventHandler<AddressDeletedEvent>
{
  handle(event: AddressDeletedEvent): void {
    logger.warn(
      `Address deleted: ${event.address.get('name').getValue()}, with id: ${event.address.get('id').getValue()}`,
    );
  }
}
