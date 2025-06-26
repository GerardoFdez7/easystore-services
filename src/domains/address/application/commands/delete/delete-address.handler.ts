import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { AddressDeleteDTO } from './delete-address.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import IAddressRepository from 'src/domains/address/aggregates/repositories/address.interface';
import { AddressDTO, AddressMapper } from '../../mappers';
import { Id } from '@domains/value-objects';

@CommandHandler(AddressDeleteDTO)
export class DeleteAddressHandler implements ICommandHandler<AddressDeleteDTO> {
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AddressDeleteDTO): Promise<AddressDTO> {
    const addressId = Id.create(command.id);

    const address = await this.addressRepository.findById(addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${command.id} not found`);
    }
    
    const deletedAddress = this.eventPublisher.mergeObjectContext(
      AddressMapper.fromDeleteDto(address)
    );

    await this.addressRepository.delete(addressId);

    deletedAddress.commit();

    return AddressMapper.toDto(address);
  }
}
