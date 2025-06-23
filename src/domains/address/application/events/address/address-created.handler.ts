import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { AddressCreatedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AddressCreatedEvent)
export class AddressCreatedHandler
  implements IEventHandler<AddressCreatedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: AddressCreatedEvent): void {
    this.logger.log(`Address created: ${event.address.get('name').getValue()}`);
  }
}
