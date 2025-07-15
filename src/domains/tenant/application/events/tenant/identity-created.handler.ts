import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AuthenticationRegisterEvent } from '@authentication/aggregates/events';
import { AccountTypeEnum } from '@authentication/aggregates/value-objects';
import { TenantSingUpDTO } from '../../commands/create/sing-up.dto';

@Injectable()
@EventsHandler(AuthenticationRegisterEvent)
export class IdentityCreatedHandler
  implements IEventHandler<AuthenticationRegisterEvent>
{
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: AuthenticationRegisterEvent): Promise<void> {
    if (event.auth.get('accountType').getValue() === AccountTypeEnum.TENANT) {
      const ownerName = event.auth.get('email').getValue().split('@')[0];
      await this.commandBus.execute(
        new TenantSingUpDTO({
          ownerName: ownerName,
          authIdentityId: event.auth.get('id').getValue(),
        }),
      );
    }
  }
}
