import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { FindTenantByBusinessNameDTO } from './businessname.dto';
import { BusinessName } from '../../../aggregates/value-objects';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';
import { TenantMapper, TenantDTO } from '../../mappers';

@QueryHandler(FindTenantByBusinessNameDTO)
export class FindTenantByBusinessNameHandler
  implements IQueryHandler<FindTenantByBusinessNameDTO>
{
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(query: FindTenantByBusinessNameDTO): Promise<TenantDTO | null> {
    const { businessName } = query;

    const ecommerceName = BusinessName.create(businessName);

    const tenant =
      await this.tenantRepository.findByBusinessName(ecommerceName);

    if (!tenant) {
      throw new NotFoundException(
        `Tenant with business name ${businessName} not found`,
      );
    }

    // Use the centralized TenantMapper to convert domain entity to DTO
    return TenantMapper.toDto(tenant);
  }
}
