import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Id } from '@shared/value-objects';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';
import { TenantMapper } from '../../mappers';
import { GetTenantByAuthIdentityDTO } from './get-tenant-by-auth-identity.dto';

@QueryHandler(GetTenantByAuthIdentityDTO)
export class GetTenantByAuthIdentityHandler
  implements IQueryHandler<GetTenantByAuthIdentityDTO>
{
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(query: GetTenantByAuthIdentityDTO): Promise<string | null> {
    const tenant = await this.tenantRepository.findByAuthIdentityId(
      Id.create(query.authIdentityId),
    );

    return tenant ? TenantMapper.toDto(tenant).id : null;
  }
}
