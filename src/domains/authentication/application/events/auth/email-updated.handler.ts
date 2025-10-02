import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AuthenticationUpdateEmailEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AuthenticationUpdateEmailEvent)
export class IdentityEmailUpdatedHandler
  implements IEventHandler<AuthenticationUpdateEmailEvent>
{
  handle(event: AuthenticationUpdateEmailEvent): void {
    logger.log(
      `Email updated for Identity ${event.auth.get('email').getValue()} type ${event.auth.get('accountType').getValue()} with ID: ${event.auth.get('id').getValue()}`,
    );
  }
}
