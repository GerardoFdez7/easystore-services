import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateCustomerDto } from './create-customer.dto';
import { CustomerDTO } from '../../mappers/customer/customer.dto';
import { CustomerMapper } from '../../mappers/customer/customer.mapper';
import { Customer } from 'src/domains/customer/aggregates/entities/customer.entity';
import { ICustomerRepository } from 'src/domains/customer/aggregates/repositories/customer.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(CreateCustomerDto)
export class CreateCustomerHandler
  implements ICommandHandler<CreateCustomerDto>
{
  constructor(
    private readonly eventPublisher: EventPublisher,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(command: CreateCustomerDto): Promise<CustomerDTO> {
    // Creating customer entity
    const customerWithEvents = this.eventPublisher.mergeObjectContext(
      Customer.create(command.data),
    );
    // Persist the customer in DB
    const savedCustomer =
      await this.customerRepository.create(customerWithEvents);

    customerWithEvents.commit();

    // Map the saved customer entity to DTO and return
    return CustomerMapper.toDto(savedCustomer);
  }
}
