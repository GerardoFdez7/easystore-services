import { AuthenticationLoginEvent } from '../../../aggregates/events';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@logger/winston.service';

@Injectable()
@EventsHandler(AuthenticationLoginEvent)
export class IdentityLoggedInHandler
  implements IEventHandler<AuthenticationLoginEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: AuthenticationLoginEvent): void {
    this.logger.log(
      `Identity ${event.auth.get('email').getValue()} type ${event.auth.get('accountType').getValue()} logged in with ID: ${event.auth.get('id').getValue()}`,
    );
  }
}
