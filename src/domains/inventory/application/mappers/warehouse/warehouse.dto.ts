import { IWarehouseType } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Warehouse entity
 * Follows the same structure as IWarehouseType
 */
export type WarehouseDTO = IWarehouseType;

/**
 * Interface for paginated warehouse results
 */
export interface PaginatedWarehousesDTO {
  warehouses: WarehouseDTO[];
  total: number;
  hasMore: boolean;
} 