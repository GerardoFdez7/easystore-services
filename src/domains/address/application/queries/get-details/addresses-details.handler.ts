import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAddressesDetailsDTO } from './addresses-details.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { IAddressRepository } from '../../../aggregates/repositories/address.interface';
import { Id } from '../../../aggregates/value-objects';
import { AddressDetailsDTO } from '@domains/dtos';

@QueryHandler(GetAddressesDetailsDTO)
export class GetAddressesDetailsHandler
  implements IQueryHandler<GetAddressesDetailsDTO, AddressDetailsDTO[]>
{
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(query: GetAddressesDetailsDTO): Promise<AddressDetailsDTO[]> {
    if (!query.addressIds || query.addressIds.length === 0) {
      return [];
    }
    const addressIds = query.addressIds.map((id) => Id.create(id));

    const addressDetails =
      await this.addressRepository.findDetailsByIds(addressIds);

    if (!addressDetails || addressDetails.length === 0) {
      throw new NotFoundException(`No addresses found`);
    }

    return addressDetails;
  }
}
