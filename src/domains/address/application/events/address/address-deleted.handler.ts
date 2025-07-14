import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { AddressDeletedEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AddressDeletedEvent)
export class AddressDeletedHandler
  implements IEventHandler<AddressDeletedEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: AddressDeletedEvent): void {
    this.logger.warn(
      `Address deleted: ${event.address.get('name').getValue()}, with id: ${event.address.get('id').getValue()}`,
    );
  }
}
