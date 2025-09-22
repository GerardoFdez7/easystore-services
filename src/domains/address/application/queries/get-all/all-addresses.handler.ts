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
    const { page, limit, name, addressType } = options || {};

    if ((!tenantId && !customerId) || (tenantId && customerId)) {
      throw new Error('You must provide either tenantId or customerId');
    }
    const owner = tenantId
      ? { tenantId: Id.create(tenantId) }
      : { customerId: Id.create(customerId) };

    // result contains paginated Address domain entities with metadata
    const result = await this.addressRepository.findAll(owner, {
      page,
      limit,
      name,
      addressType: addressType ? AddressType.create(addressType) : undefined,
    });

    if (!result || result.addresses.length === 0) {
      throw new NotFoundException(`No address found`);
    }

    // Transform domain entities to DTOs
    return AddressMapper.fromAllAddress(result);
  }
}
