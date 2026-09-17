import { BadRequestException, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Id } from '@shared/aggregates/value-objects';
import { IStoreRepository } from '../../../aggregates/repositories';
import { StoreMapper, StoreDTO } from '../../mappers';
import { GetAllStoresDTO } from './get-all-stores.dto';

export interface PaginatedStoresDTO {
  stores: StoreDTO[];
  total: number;
  hasMore: boolean;
}

@QueryHandler(GetAllStoresDTO)
export class GetAllStoresHandler implements IQueryHandler<GetAllStoresDTO> {
  constructor(
    @Inject('IStoreRepository') private readonly repository: IStoreRepository,
  ) {}

  async execute(query: GetAllStoresDTO): Promise<PaginatedStoresDTO> {
    if (!Number.isInteger(query.page) || query.page < 1)
      throw new BadRequestException('page must be a positive integer');
    if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 100)
      throw new BadRequestException(
        'limit must be an integer between 1 and 100',
      );
    const result = await this.repository.findAllByTenantId(
      Id.create(query.tenantId),
      query.page,
      query.limit,
    );
    return {
      stores: result.stores.map((store) => StoreMapper.toDto(store)),
      total: result.total,
      hasMore: query.page * query.limit < result.total,
    };
  }
}
