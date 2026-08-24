import { Inject, Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AuthenticationRegisterEvent } from '../../../aggregates/events';
import { AccountTypeEnum } from '../../../aggregates/value-objects';
import { ICustomerAdapter, ITenantAdapter } from '../../ports';

@Injectable()
@EventsHandler(AuthenticationRegisterEvent)
export class CustomerProvisioningHandler
  implements IEventHandler<AuthenticationRegisterEvent>
{
  constructor(
    @Inject('ICustomerAdapter')
    private readonly customerAdapter: ICustomerAdapter,
    @Inject('ITenantAdapter') private readonly tenantAdapter: ITenantAdapter,
  ) {}

  async handle(event: AuthenticationRegisterEvent): Promise<void> {
    if (
      event.auth.get('accountType').getValue() !== AccountTypeEnum.CUSTOMER ||
      !event.domain
    ) {
      return;
    }

    const tenantId = await this.tenantAdapter.getTenantIdByDomain(event.domain);
    if (!tenantId) {
      return;
    }

    await this.customerAdapter.provisionCustomer({
      authIdentityId: event.auth.get('id').getValue(),
      name: event.auth.get('email').getValue().split('@')[0],
      tenantId,
    });
  }
}
