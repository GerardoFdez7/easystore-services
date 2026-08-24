import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCustomerDto } from '@customer/application/commands';
import {
  CustomerIdentityDTO,
  FindCustomerByAuthIdentityIdDto,
} from '@customer/application/queries';
import {
  ICustomerAdapter,
  ICustomerProvisioningData,
} from '../../application/ports';

@Injectable()
export class CustomerAdapter implements ICustomerAdapter {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  findByAuthIdentityId(
    authIdentityId: string,
  ): Promise<CustomerIdentityDTO | null> {
    return this.queryBus.execute(
      new FindCustomerByAuthIdentityIdDto(authIdentityId),
    );
  }

  async provisionCustomer(data: ICustomerProvisioningData): Promise<void> {
    await this.commandBus.execute(new CreateCustomerDto(data));
  }
}
