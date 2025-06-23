import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import IAddressRepository from '../../../aggregates/repositories/address.interface';
import { CreateAddressDto } from './create-address.dto';
import { AddressMapper, AddressDTO } from '../../mappers';

@CommandHandler(CreateAddressDto)
export class CreateAddressHandler implements ICommandHandler<CreateAddressDto> {
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateAddressDto): Promise<AddressDTO> {
    const address = this.eventPublisher.mergeObjectContext(
      AddressMapper.fromCreateDto(command.data),
    );

    await this.addressRepository.create(address);
    address.commit();
    return AddressMapper.toDto(address);
  }
}
