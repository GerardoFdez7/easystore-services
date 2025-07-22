import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { GetWarehouseByIdQuery } from './get-warehouse-by-id.query';
import { WarehouseMapper, WarehouseDTO } from '../../mappers';
import { Id } from '@domains/value-objects';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetWarehouseByIdQuery)
export class GetWarehouseByIdHandler
  implements IQueryHandler<GetWarehouseByIdQuery>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(query: GetWarehouseByIdQuery): Promise<WarehouseDTO | null> {
    const warehouse = await this.inventoryRepository.getWarehouseById(
      Id.create(query.id),
    );

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with id ${query.id} not found`);
    }

    return WarehouseMapper.toDto(warehouse) as WarehouseDTO;
  }
}
