import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { GetAllWarehousesQuery } from './get-all-warehouses.query';
import { WarehouseMapper, WarehouseDTO } from '../../mappers';
import { Id } from '@domains/value-objects';

@QueryHandler(GetAllWarehousesQuery)
export class GetAllWarehousesHandler
  implements IQueryHandler<GetAllWarehousesQuery>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(query: GetAllWarehousesQuery): Promise<WarehouseDTO[]> {
    const { tenantId, page, limit, name, addressId, sortBy, sortOrder } = query;
    const { warehouses } = await this.inventoryRepository.findAllWarehouses(
      Id.create(tenantId),
      {
        page,
        limit,
        name,
        addressId: addressId ? Id.create(addressId) : undefined,
        sortBy: sortBy as 'createdAt' | 'name' | 'addressId',
        sortOrder: sortOrder as 'asc' | 'desc',
      },
    );

    if (!warehouses || warehouses.length === 0) {
      throw new NotFoundException(
        `No warehouses found for tenant with id ${tenantId}`,
      );
    }

    return warehouses.map(
      (warehouse) => WarehouseMapper.toDto(warehouse) as WarehouseDTO,
    );
  }
}
