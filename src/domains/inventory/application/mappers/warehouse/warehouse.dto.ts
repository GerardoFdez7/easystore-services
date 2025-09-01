import { IWarehouseType } from '../../../aggregates/entities';

export interface WarehouseDTO extends IWarehouseType {
  addressLine1?: string;
  city?: string;
  countryCode?: string;
  postalCode?: string;
}

/**
 * Interface for paginated warehouse results
 */
export interface PaginatedWarehousesDTO {
  warehouses: WarehouseDTO[];
  total: number;
  hasMore: boolean;
}
