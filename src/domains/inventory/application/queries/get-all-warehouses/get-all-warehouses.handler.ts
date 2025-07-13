import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { GetAllWarehousesQuery } from './get-all-warehouses.query';
import { WarehouseMapper, WarehouseDTO } from '../../mappers';

@QueryHandler(GetAllWarehousesQuery)
export class GetAllWarehousesHandler implements IQueryHandler<GetAllWarehousesQuery> {
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(query: GetAllWarehousesQuery): Promise<WarehouseDTO[]> {
    const warehouses = await this.inventoryRepository.getAllWarehouses();

    return warehouses.map(warehouse => 
      WarehouseMapper.toDto(warehouse) as WarehouseDTO
    );
  }
} 