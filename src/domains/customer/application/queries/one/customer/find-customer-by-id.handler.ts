import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindCustomerByIdDto } from './find-customer-by-id.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { ICustomerRepository } from 'src/domains/customer/aggregates/repositories/customer.interface';
import { Id } from '@shared/value-objects';
import { CustomerDTO, CustomerMapper } from '../../../mappers';

@QueryHandler(FindCustomerByIdDto)
export class FindCustomerByIdHandler
  implements IQueryHandler<FindCustomerByIdDto>
{
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(query: FindCustomerByIdDto): Promise<CustomerDTO> {
    const { customerId, tenantId } = query;

    const customerFound = await this.customerRepository.findCustomerById(
      Id.create(customerId),
      Id.create(tenantId),
    );

    if (!customerFound) throw new NotFoundException('Customer not found.');

    return CustomerMapper.toDto(customerFound);
  }
}
