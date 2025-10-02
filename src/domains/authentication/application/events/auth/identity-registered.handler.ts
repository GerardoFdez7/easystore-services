import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AuthenticationRegisterEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AuthenticationRegisterEvent)
export class IdentityRegisteredHandler
  implements IEventHandler<AuthenticationRegisterEvent>
{
  handle(event: AuthenticationRegisterEvent): void {
    logger.log(
      `Identity ${event.auth.get('email').getValue()} type ${event.auth.get('accountType').getValue()} registered with ID: ${event.auth.get('id').getValue()}`,
    );
  }
}
