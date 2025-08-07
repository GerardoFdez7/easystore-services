import { IWarehouseType } from '../../../aggregates/entities';

export type WarehouseDTO = IWarehouseType;

/**
 * Interface for paginated warehouse results
 */
export interface PaginatedWarehousesDTO {
  warehouses: WarehouseDTO[];
  total: number;
  hasMore: boolean;
}
