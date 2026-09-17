import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Id } from '@shared/aggregates/value-objects';
import {
  ITenantLoginContext,
  ITenantRepository,
} from '../../../aggregates/repositories/tenant.interface';
import { ResolveTenantLoginContextDTO } from './resolve-tenant-login-context.dto';

@QueryHandler(ResolveTenantLoginContextDTO)
export class ResolveTenantLoginContextHandler
  implements IQueryHandler<ResolveTenantLoginContextDTO>
{
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(
    query: ResolveTenantLoginContextDTO,
  ): Promise<ITenantLoginContext | null> {
    return this.tenantRepository.resolveLoginContext(
      Id.create(query.authIdentityId),
    );
  }
}
