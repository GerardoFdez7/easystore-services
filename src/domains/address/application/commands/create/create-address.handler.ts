import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import IAddressRepository from '../../../aggregates/repositories/address.interface';
import { CreateAddressDTO } from './create-address.dto';
import { AddressMapper, AddressDTO } from '../../mappers';

@CommandHandler(CreateAddressDTO)
export class CreateAddressHandler implements ICommandHandler<CreateAddressDTO> {
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateAddressDTO): Promise<AddressDTO> {
    const { tenantId, customerId } = command.data;

    if ((!tenantId && !customerId) || (tenantId && customerId)) {
      throw new Error('You must provide either tenantId or customerId');
    }

    // Mapper to create the domain entity
    const address = this.eventPublisher.mergeObjectContext(
      AddressMapper.fromCreateDto(command.data),
    );

    // Persist through repository
    await this.addressRepository.create(address);

    // Commit events to event bus
    address.commit();

    // Return the address as DTO
    return AddressMapper.toDto(address);
  }
}
