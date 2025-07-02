import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { UpdateAddressDTO } from './update-address.dto';
import IAddressRepository from '../../../aggregates/repositories/address.interface';
import { AddressMapper, AddressDTO } from '../../mappers';
import { Id } from '../../../aggregates/value-objects';

@CommandHandler(UpdateAddressDTO)
export class UpdateAddressHandler implements ICommandHandler<UpdateAddressDTO> {
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateAddressDTO): Promise<AddressDTO> {
    const { id, tenantId, customerId } = command;

    if ((!tenantId && !customerId) || (tenantId && customerId)) {
      throw new Error('You must provide either tenantId or customerId');
    }

    const addressId = Id.create(id);
    const owner = tenantId
      ? { tenantId: Id.create(tenantId) }
      : { customerId: Id.create(customerId) };

    //Find the address by ID
    const address = await this.addressRepository.findById(addressId, owner);
    if (!address) {
      throw new NotFoundException(`Address with ID ${command.id} not found`);
    }
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
