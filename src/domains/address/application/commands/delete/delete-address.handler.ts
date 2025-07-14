import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { AddressDeleteDTO } from './delete-address.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { IAddressRepository } from 'src/domains/address/aggregates/repositories/address.interface';
import { AddressDTO, AddressMapper } from '../../mappers';
import { Id } from '../../../aggregates/value-objects';

@CommandHandler(AddressDeleteDTO)
export class DeleteAddressHandler implements ICommandHandler<AddressDeleteDTO> {
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AddressDeleteDTO): Promise<AddressDTO> {
    const { id, tenantId, customerId } = command;

    if ((!tenantId && !customerId) || (tenantId && customerId)) {
      throw new Error('You must provide either tenantId or customerId');
    }

    const addressId = Id.create(id);
    const owner = tenantId
      ? { tenantId: Id.create(tenantId) }
      : { customerId: Id.create(customerId) };

    //Find the address by Id
    const address = await this.addressRepository.findById(addressId, owner);
    if (!address) {
      throw new NotFoundException(`Address with ID ${command.id} not found`);
    }

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
