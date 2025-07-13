import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { GetWarehouseByIdQuery } from './get-warehouse-by-id.query';
import { WarehouseMapper, WarehouseDTO } from '../../mappers';

@QueryHandler(GetWarehouseByIdQuery)
export class GetWarehouseByIdHandler implements IQueryHandler<GetWarehouseByIdQuery> {
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(query: GetWarehouseByIdQuery): Promise<WarehouseDTO | null> {
    const warehouse = await this.inventoryRepository.getWarehouseById(query.id);

    if (!warehouse) {
      return null;
    }

    return WarehouseMapper.toDto(warehouse) as WarehouseDTO;
  }
} 