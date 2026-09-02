import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Id } from '@shared/aggregates/value-objects';
import { ICustomerRepository } from '../../../../../aggregates/repositories';
import {
  CustomerIdentityDTO,
  FindCustomerByAuthIdentityIdDto,
} from './find-customer-by-auth-identity-id.dto';

@QueryHandler(FindCustomerByAuthIdentityIdDto)
export class FindCustomerByAuthIdentityIdHandler
  implements IQueryHandler<FindCustomerByAuthIdentityIdDto>
{
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    query: FindCustomerByAuthIdentityIdDto,
  ): Promise<CustomerIdentityDTO | null> {
    return this.customerRepository.findByAuthIdentityId(
      Id.create(query.authIdentityId),
    );
  }
}
