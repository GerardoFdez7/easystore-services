import { IStockMovementType } from '../../../aggregates/entities';

/**
 * Data Transfer Object for StockMovement entity
 * Follows the same structure as IStockMovementType
 */
export type StockMovementDTO = IStockMovementType;

/**
 * Interface for paginated stock movement results
 */
export interface PaginatedStockMovementsDTO {
  stockMovements: StockMovementDTO[];
  total: number;
  hasMore: boolean;
} 