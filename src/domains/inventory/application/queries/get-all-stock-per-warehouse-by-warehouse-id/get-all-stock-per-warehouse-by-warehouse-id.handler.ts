import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { GetAllStockPerWarehouseByWarehouseIdQuery } from './get-all-stock-per-warehouse-by-warehouse-id.query';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';

@QueryHandler(GetAllStockPerWarehouseByWarehouseIdQuery)
export class GetAllStockPerWarehouseByWarehouseIdHandler
  implements IQueryHandler<GetAllStockPerWarehouseByWarehouseIdQuery>
{
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(
    query: GetAllStockPerWarehouseByWarehouseIdQuery,
  ): Promise<StockPerWarehouseDTO[]> {
    const stocks =
      await this.inventoryRepository.getAllStockPerWarehouseByWarehouseId(
        query.warehouseId,
      );
    return stocks.map((stock) => StockPerWarehouseMapper.toDto(stock));
  }
}
