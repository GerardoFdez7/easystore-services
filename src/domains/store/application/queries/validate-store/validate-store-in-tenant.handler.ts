import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Id } from '@shared/aggregates/value-objects';
import { IStoreRepository } from '../../../aggregates/repositories';
import { StoreMapper, StoreDTO } from '../../mappers';
import { ValidateStoreInTenantDTO } from './validate-store-in-tenant.dto';

@QueryHandler(ValidateStoreInTenantDTO)
export class ValidateStoreInTenantHandler
  implements IQueryHandler<ValidateStoreInTenantDTO>
{
  constructor(
    @Inject('IStoreRepository') private readonly repository: IStoreRepository,
  ) {}

  async execute(query: ValidateStoreInTenantDTO): Promise<StoreDTO | null> {
    const store = await this.repository.findByIdAndTenantId(
      Id.create(query.id),
      Id.create(query.tenantId),
    );
    return store ? StoreMapper.toDto(store) : null;
  }
}
