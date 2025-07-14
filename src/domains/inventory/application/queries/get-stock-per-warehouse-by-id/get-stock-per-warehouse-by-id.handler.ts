import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IInventoryRepository } from '../../../aggregates/repositories/inventory.interface';
import { GetStockPerWarehouseByIdQuery } from './get-stock-per-warehouse-by-id.query';
import { StockPerWarehouseMapper, StockPerWarehouseDTO } from '../../mappers';

@QueryHandler(GetStockPerWarehouseByIdQuery)
export class GetStockPerWarehouseByIdHandler implements IQueryHandler<GetStockPerWarehouseByIdQuery> {
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async execute(query: GetStockPerWarehouseByIdQuery): Promise<StockPerWarehouseDTO | null> {
    const stock = await this.inventoryRepository.getStockPerWarehouseById(query.id);
    if (!stock) return null;
    return StockPerWarehouseMapper.toDto(stock) as StockPerWarehouseDTO;
  }
} 