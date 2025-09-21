import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@logger/winston.service';
import { AddressUpdatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AddressUpdatedEvent)
export class AddressUpdatedHandler
  implements IEventHandler<AddressUpdatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: AddressUpdatedEvent): void {
    this.logger.log(
      `Address updated: ${event.address.get('name').getValue()}, with Id: ${event.address.get('id').getValue()}`,
    );
  }
}
