import { GetTenantByIdDTO } from './get-tenant-by-id.dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { Id } from '@shared/value-objects';
import { ITenantRepository } from 'src/domains/tenant/aggregates/repositories/tenant.interface';
import { TenantDTO, TenantMapper } from '../../mappers';

@QueryHandler(GetTenantByIdDTO)
export class GetTenantByIdHandler implements IQueryHandler<GetTenantByIdDTO> {
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(query: GetTenantByIdDTO): Promise<TenantDTO> {
    const tenant = await this.tenantRepository.findById(Id.create(query.id));
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${query.id} not found`);
    }
    return TenantMapper.toDto(tenant);
  }
}
