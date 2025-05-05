import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTenantByEmailDTO } from './email.dto';
import { Email } from '../../../aggregates/value-objects/email.value-object';
import { ITenantRepository } from '../../../aggregates/repositories/tenant.interface';
import { TenantDto } from '../../mappers/tenant.dto';
import { Inject } from '@nestjs/common';
import { TenantMapper } from '../../mappers/tenant.mapper';

@QueryHandler(FindTenantByEmailDTO)
export class FindTenantByEmailHandler
  implements IQueryHandler<FindTenantByEmailDTO>
{
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(query: FindTenantByEmailDTO): Promise<TenantDto | null> {
    const email = Email.create(query.email);
    const tenant = await this.tenantRepository.findByEmail(email);

    if (!tenant) {
      return null;
    }

    // Use the centralized TenantMapper to convert domain entity to DTO
    return TenantMapper.toDto(tenant);
  }
}
