import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IAddressRepository } from '../../../aggregates/repositories/address.interface';
import { AddressType } from '../../../aggregates/value-objects';
import { AddressMapper, AllAddressDTO } from '../../mappers';
import { GetAllAddressesDTO } from './all-addresses.dto';
import { resolveAddressOwner } from '../../address-owner';

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

    const owner = resolveAddressOwner(tenantId, customerId);

    // result contains paginated Address domain entities with metadata
    const result = await this.addressRepository.findAll(owner, {
      page,
      limit,
      name,
      addressType: addressType ? AddressType.create(addressType) : undefined,
    });

    // Transform domain entities to DTOs
    return AddressMapper.fromAllAddress(result);
  }
}
