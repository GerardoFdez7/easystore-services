import { AuthenticationLoginEvent } from '../../../aggregates/events';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';

@Injectable()
@EventsHandler(AuthenticationLoginEvent)
export class IdentityLoggedInHandler
  implements IEventHandler<AuthenticationLoginEvent>
{
  handle(event: AuthenticationLoginEvent): void {
    logger.log(
      `Identity ${event.auth.get('email').getValue()} type ${event.auth.get('accountType').getValue()} logged in with ID: ${event.auth.get('id').getValue()}`,
    );
  }
}
