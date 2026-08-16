import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IAddressRepository } from '../../../aggregates/repositories/address.interface';
import { Id } from '../../../aggregates/value-objects';
import { AddressMapper, AddressDTO } from '../../mappers';
import { GetAddressIdDto } from './id-address.dto';
import { resolveAddressOwner } from '../../address-owner';

@QueryHandler(GetAddressIdDto)
export class GetAddressByIdHandler implements IQueryHandler<GetAddressIdDto> {
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(query: GetAddressIdDto): Promise<AddressDTO> {
    const { id, tenantId, customerId } = query;

    const owner = resolveAddressOwner(tenantId, customerId);

    const address = await this.addressRepository.findById(Id.create(id), owner);
    if (!address) {
      throw new NotFoundException(`Address with id ${query.id} not found`);
    }

    return AddressMapper.toDto(address);
  }
}
