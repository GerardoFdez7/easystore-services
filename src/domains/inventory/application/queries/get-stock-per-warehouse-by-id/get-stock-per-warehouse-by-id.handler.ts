import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { GetStockPerWarehouseByIdQuery } from './get-stock-per-warehouse-by-id.query';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';
import { Id } from '@domains/value-objects';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetStockPerWarehouseByIdQuery)
export class GetStockPerWarehouseByIdHandler
  implements IQueryHandler<GetStockPerWarehouseByIdQuery>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(
    query: GetStockPerWarehouseByIdQuery,
  ): Promise<StockPerWarehouseDTO | null> {
    const stock = await this.inventoryRepository.getStockPerWarehouseById(
      Id.create(query.id),
      Id.create(query.warehouseId),
    );
    if (!stock)
      throw new NotFoundException(
        `StockPerWarehouse with id ${query.id} and warehouseId ${query.warehouseId} not found`,
      );
    return StockPerWarehouseMapper.toDto(stock) as StockPerWarehouseDTO;
  }
}
