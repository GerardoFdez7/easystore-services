import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IStoreRepository } from '../../../aggregates/repositories';
import { StoreMapper, StoreDTO } from '../../mappers';
import { GetStoreByDomainDTO } from './get-store-by-domain.dto';

@QueryHandler(GetStoreByDomainDTO)
export class GetStoreByDomainHandler
  implements IQueryHandler<GetStoreByDomainDTO>
{
  constructor(
    @Inject('IStoreRepository') private readonly repository: IStoreRepository,
  ) {}

  async execute(query: GetStoreByDomainDTO): Promise<StoreDTO | null> {
    const store = await this.repository.findByDomain(
      query.domain.toLowerCase(),
    );
    return store ? StoreMapper.toDto(store) : null;
  }
}
