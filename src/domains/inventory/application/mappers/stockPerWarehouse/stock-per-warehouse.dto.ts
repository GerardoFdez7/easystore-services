import { IStockPerWarehouseType } from '../../../aggregates/entities';

/**
 * Data Transfer Object for StockPerWarehouse entity
 * Follows the same structure as IStockPerWarehouseType
 */
export type StockPerWarehouseDTO = IStockPerWarehouseType;

/**
 * Interface for paginated stock per warehouse results
 */
export interface PaginatedStockPerWarehousesDTO {
  stockPerWarehouses: StockPerWarehouseDTO[];
  total: number;
  hasMore: boolean;
} 