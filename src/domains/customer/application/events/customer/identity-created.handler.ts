import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AuthenticationRegisterEvent } from '@authentication/aggregates/events';
import { AccountTypeEnum } from '@authentication/aggregates/value-objects';
import { CreateCustomerDto } from '../../commands/create/create-customer.dto';

@Injectable()
@EventsHandler(AuthenticationRegisterEvent)
export class IdentityCreatedHandler
  implements IEventHandler<AuthenticationRegisterEvent>
{
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: AuthenticationRegisterEvent): Promise<void> {
    console.log('1.');
    if (event.auth.get('accountType').getValue() === AccountTypeEnum.CUSTOMER) {
      console.log('2.');
      const name = event.auth.get('email').getValue().split('.')[0];
      const tenantId = '019964c4-bde5-7756-980c-8154fbe45539'; // -> Import custom repository and use getTenantIdByDomain
      await this.commandBus.execute(
        new CreateCustomerDto({
          name,
          authIdentityId: event.auth.get('id').getValue(),
          tenantId,
        }),
      );
    }
  }
}
