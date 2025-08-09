import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@winston/winston.service';
import { AuthenticationUpdateEmailEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AuthenticationUpdateEmailEvent)
export class IdentityEmailUpdatedHandler
  implements IEventHandler<AuthenticationUpdateEmailEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: AuthenticationUpdateEmailEvent): void {
    this.logger.log(
      `Email updated for Identity ${event.auth.get('email').getValue()} type ${event.auth.get('accountType').getValue()} with ID: ${event.auth.get('id').getValue()}`,
    );
  }
}
