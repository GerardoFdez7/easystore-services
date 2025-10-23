import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { AuthenticationRegisterEvent } from '@authentication/aggregates/events';
import { AccountTypeEnum } from '@authentication/aggregates/value-objects';
import { CreateCustomerDto } from '../../commands/create/create-customer.dto';
import { ITenantRepository } from 'src/domains/tenant/aggregates/repositories/tenant.interface';
import { Domain } from 'src/domains/tenant/aggregates/value-objects';

@Injectable()
@EventsHandler(AuthenticationRegisterEvent)
export class IdentityCreatedHandler
  implements IEventHandler<AuthenticationRegisterEvent>
{
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async handle(event: AuthenticationRegisterEvent): Promise<void> {
    if (event.auth.get('accountType').getValue() === AccountTypeEnum.CUSTOMER) {
      const name = event.domain.split('.')[0];
      logger.log(name);
      const tenantId = await this.tenantRepository.getTenantIdByDomain(
        Domain.create(name),
      );
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
