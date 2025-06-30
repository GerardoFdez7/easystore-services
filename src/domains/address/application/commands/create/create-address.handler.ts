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

    const address = this.eventPublisher.mergeObjectContext(
      AddressMapper.fromCreateDto(command.data),
    );

    await this.addressRepository.create(address);
    address.commit();
    return AddressMapper.toDto(address);
  }
}
