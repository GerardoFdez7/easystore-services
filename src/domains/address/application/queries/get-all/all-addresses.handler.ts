import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IAddressRepository } from '../../../aggregates/repositories/address.interface';
import { Id, AddressType } from '../../../aggregates/value-objects';
import { AddressMapper, AllAddressDTO } from '../../mappers';
import { GetAllAddressesDTO } from './all-addresses.dto';

@QueryHandler(GetAllAddressesDTO)
export class GetAllAddressesHandler
  implements IQueryHandler<GetAllAddressesDTO>
{
  constructor(
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(query: GetAllAddressesDTO): Promise<AllAddressDTO> {
    const { tenantId, customerId, options } = query;
    const { addressType } = options || {};

    if ((!tenantId && !customerId) || (tenantId && customerId)) {
      throw new Error('You must provide either tenantId or customerId');
    }
    const owner = tenantId
      ? { tenantId: Id.create(tenantId) }
      : { customerId: Id.create(customerId) };

    // result contains an array of Address domain entities
    const result = await this.addressRepository.findAll(owner, {
      addressType: addressType ? AddressType.create(addressType) : undefined,
    });

    if (!result) {
      throw new NotFoundException(`No address found`);
    }

    // Transform domain entities to DTOs
    return AddressMapper.fromAllAddress(result);
  }
}
