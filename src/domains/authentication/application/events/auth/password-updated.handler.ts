import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AuthenticationUpdatePasswordEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AuthenticationUpdatePasswordEvent)
export class IdentityPasswordUpdatedHandler
  implements IEventHandler<AuthenticationUpdatePasswordEvent>
{
  handle(event: AuthenticationUpdatePasswordEvent): void {
    logger.log(
      `Password updated for Identity ${event.auth.get('email').getValue()} type ${event.auth.get('accountType').getValue()} with ID: ${event.auth.get('id').getValue()}`,
    );
  }
}
