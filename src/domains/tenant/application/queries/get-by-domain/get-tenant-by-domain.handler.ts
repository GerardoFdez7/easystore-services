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

  async execute(query: GetTenantByDomainDto): Promise<string | null> {
    let domain: Domain;
    try {
      domain = Domain.create(query.domain);
    } catch {
      return null;
    }

    return this.tenantRepository.getTenantIdByDomain(domain);
  }
}
