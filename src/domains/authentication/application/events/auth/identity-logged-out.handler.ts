import { AuthenticationLogoutEvent } from '../../../aggregates/events';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';

@Injectable()
@EventsHandler(AuthenticationLogoutEvent)
export class IdentityLoggedOutHandler
  implements IEventHandler<AuthenticationLogoutEvent>
{
  handle(event: AuthenticationLogoutEvent): void {
    logger.log(
      `Identity ${event.auth.get('email').getValue()} type ${event.auth.get('accountType').getValue()} logged out with ID: ${event.auth.get('id').getValue()}`,
    );
  }
}
