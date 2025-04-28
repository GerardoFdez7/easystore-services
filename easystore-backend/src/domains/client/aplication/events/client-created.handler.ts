import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ClientCreatedEvent } from '../../aggregates/events/client-created.event';
import { LoggerService } from '@shared/winston/winston.service';

@Injectable()
@EventsHandler(ClientCreatedEvent)
export class ClientCreatedHandler implements IEventHandler<ClientCreatedEvent> {
  constructor(private readonly logger: LoggerService) {}

  handle(event: ClientCreatedEvent): void {
    // Here we can implement side effects when a client is created
    // For example: send welcome email, create default settings, etc.
    this.logger.log(
      `Client created: ${event.client.getOwnerName().getValue()}`,
    );
  }
}
