import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  CustomerIdentityDTO,
  FindCustomerByAuthIdentityIdDto,
} from '@customer/application/queries';
import { ICustomerAdapter } from '../../application/ports';

@Injectable()
export class CustomerAdapter implements ICustomerAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  findByAuthIdentityId(
    authIdentityId: string,
  ): Promise<CustomerIdentityDTO | null> {
    return this.queryBus.execute(
      new FindCustomerByAuthIdentityIdDto(authIdentityId),
    );
  }
}
