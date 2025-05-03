import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTenantByBusinessNameDTO } from './businessname.dto';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.repository.interface';
import { TenantDto } from '../../mappers/tenant.dto';
import { Inject } from '@nestjs/common';
import { TenantMapper } from '../../mappers/tenant.mapper';

@QueryHandler(FindTenantByBusinessNameDTO)
export class FindTenantByBusinessNameHandler
  implements IQueryHandler<FindTenantByBusinessNameDTO>
{
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(query: FindTenantByBusinessNameDTO): Promise<TenantDto | null> {
    const tenant = await this.tenantRepository.findByBusinessName(
      query.businessName,
    );

    if (!tenant) {
      return null;
    }

    // Use the centralized TenantMapper to convert domain entity to DTO
    return TenantMapper.toDto(tenant);
  }
}
