import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateAddressDTO } from './update-address.dto';
import { IAddressRepository } from '../../../aggregates/repositories/address.interface';
import { AddressMapper, AddressDTO } from '../../mappers';
import { findAddressOrThrow } from '../../address-owner';

@CommandHandler(UpdateAddressDTO)
export class UpdateAddressHandler implements ICommandHandler<UpdateAddressDTO> {
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateAddressDTO): Promise<AddressDTO> {
    const { id, tenantId, customerId } = command;

    const { address, addressId, owner } = await findAddressOrThrow(
      this.addressRepository,
      id,
      tenantId,
      customerId,
    );
    //Update the address with the new data
    const updateAddress = this.eventPublisher.mergeObjectContext(
      AddressMapper.fromUpdateDto(address, command),
    );

    //Persist through the repository
    await this.addressRepository.update(addressId, owner, updateAddress);

    //Commit events to event bus
    updateAddress.commit();
    return AddressMapper.toDto(updateAddress);
  }
}
