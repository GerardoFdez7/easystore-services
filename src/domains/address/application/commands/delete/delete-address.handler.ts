import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { AddressDeleteDTO } from './delete-address.dto';
import { Inject } from '@nestjs/common';
import { IAddressRepository } from '../../../aggregates/repositories/address.interface';
import { AddressDTO, AddressMapper } from '../../mappers';
import { findAddressOrThrow } from '../../address-owner';

@CommandHandler(AddressDeleteDTO)
export class DeleteAddressHandler implements ICommandHandler<AddressDeleteDTO> {
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AddressDeleteDTO): Promise<AddressDTO> {
    const { id, tenantId, customerId } = command;

    const { address, addressId, owner } = await findAddressOrThrow(
      this.addressRepository,
      id,
      tenantId,
      customerId,
    );

    //Delete the address
    const deletedAddress = this.eventPublisher.mergeObjectContext(
      AddressMapper.fromDeleteDto(address),
    );

    //Delete through repository
    await this.addressRepository.delete(addressId, owner);

    // Commit events to event bus
    deletedAddress.commit();

    //Return the address as DTO
    return AddressMapper.toDto(address);
  }
}
