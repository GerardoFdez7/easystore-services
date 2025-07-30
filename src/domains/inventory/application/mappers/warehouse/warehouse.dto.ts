import { IWarehouseType } from 'src/domains/inventory/aggregates/entities';

/**
 * Interface for paginated warehouse results
 */
export interface PaginatedWarehousesDTO {
  warehouses: WarehouseDTO[];
  total: number;
  hasMore: boolean;
}

export type WarehouseDTO = IWarehouseType;
