import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Id } from '@shared/aggregates/value-objects';
import { IStoreRepository } from '../../../aggregates/repositories';
import { StoreMapper, StoreDTO } from '../../mappers';
import { GetStoreByIdDTO } from './get-store-by-id.dto';

@QueryHandler(GetStoreByIdDTO)
export class GetStoreByIdHandler implements IQueryHandler<GetStoreByIdDTO> {
  constructor(
    @Inject('IStoreRepository') private readonly repository: IStoreRepository,
  ) {}

  async execute(query: GetStoreByIdDTO): Promise<StoreDTO> {
    const store = await this.repository.findByIdAndTenantId(
      Id.create(query.id),
      Id.create(query.tenantId),
    );
    if (!store)
      throw new NotFoundException(`Store with ID ${query.id} not found`);
    return StoreMapper.toDto(store);
  }
}
