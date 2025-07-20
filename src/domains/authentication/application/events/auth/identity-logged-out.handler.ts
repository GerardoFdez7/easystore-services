import { AuthenticationLogoutEvent } from '../../../aggregates/events';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';

@Injectable()
@EventsHandler(AuthenticationLogoutEvent)
export class IdentityLoggedOutHandler
  implements IEventHandler<AuthenticationLogoutEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: AuthenticationLogoutEvent): void {
    this.logger.log(
      `Identity ${event.auth.get('email').getValue()} type ${event.auth.get('accountType').getValue()} logged out with ID: ${event.auth.get('id').getValue()}`,
    );
  }
}
