import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@logger/winston.service';
import { AuthenticationUpdatePasswordEvent } from '../../../aggregates/events';

@Injectable()
@EventsHandler(AuthenticationUpdatePasswordEvent)
export class IdentityPasswordUpdatedHandler
  implements IEventHandler<AuthenticationUpdatePasswordEvent>
{
  constructor(private readonly logger: LoggerService) {}

  handle(event: AuthenticationUpdatePasswordEvent): void {
    this.logger.log(
      `Password updated for Identity ${event.auth.get('email').getValue()} type ${event.auth.get('accountType').getValue()} with ID: ${event.auth.get('id').getValue()}`,
    );
  }
}
