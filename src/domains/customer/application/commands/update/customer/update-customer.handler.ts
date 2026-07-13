import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCustomerDto } from './update-customer.dto';
import { CustomerMapper } from '../../../mappers';
import { CustomerDTO } from '../../../mappers';
import { ICustomerRepository } from '../../../../aggregates/repositories/customer.interface';
import { Id } from '@shared/value-objects';
import { Inject, NotFoundException } from '@nestjs/common';
import { Customer } from '../../../../aggregates/entities';

@CommandHandler(UpdateCustomerDto)
export class UpdateCustomerHandler
  implements ICommandHandler<UpdateCustomerDto>
{
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateCustomerDto): Promise<CustomerDTO> {
    const tenantId = Id.create(command.tenantId);
    const customerFound = await this.customerRepository.findById(
      Id.create(command.customerId),
      tenantId,
    );

    if (!customerFound) throw new NotFoundException('Customer not found.');

    const customerWithEvents = this.eventPublisher.mergeObjectContext(
      Customer.update(customerFound, command.data),
    );

    await this.customerRepository.update(customerWithEvents, tenantId);

    // Commit event
    customerWithEvents.commit();

    return CustomerMapper.toDto(customerWithEvents);
  }
}
