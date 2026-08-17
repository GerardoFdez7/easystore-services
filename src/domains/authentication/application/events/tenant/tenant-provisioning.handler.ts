import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { AuthenticationRegisterEvent } from '../../../aggregates/events';
import { AccountTypeEnum } from '../../../aggregates/value-objects';
import { ITenantAdapter } from '../../ports';

@Injectable()
@EventsHandler(AuthenticationRegisterEvent)
export class TenantProvisioningHandler
  implements IEventHandler<AuthenticationRegisterEvent>
{
  constructor(
    @Inject('ITenantAdapter')
    private readonly tenantAdapter: ITenantAdapter,
  ) {}

  async handle(event: AuthenticationRegisterEvent): Promise<void> {
    if (event.auth.get('accountType').getValue() !== AccountTypeEnum.TENANT) {
      return;
    }

    const ownerName = event.auth.get('email').getValue().split('@')[0];
    await this.tenantAdapter.provisionTenant({
      ownerName,
      authIdentityId: event.auth.get('id').getValue(),
    });
  }
}
