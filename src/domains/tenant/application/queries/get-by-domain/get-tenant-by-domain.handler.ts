import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ITenantRepository } from '../../../aggregates/repositories';
import { Domain } from '../../../aggregates/value-objects';
import { GetTenantByDomainDto } from './get-tenant-by-domain.dto';

@QueryHandler(GetTenantByDomainDto)
export class GetTenantByDomainHandler
  implements IQueryHandler<GetTenantByDomainDto>
{
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  execute(query: GetTenantByDomainDto): Promise<string | null> {
    return this.tenantRepository.getTenantIdByDomain(
      Domain.create(query.domain),
    );
  }
}
