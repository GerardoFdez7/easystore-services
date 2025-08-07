/**
 * Data Transfer Object for StockMovement entity
 * Follows the same structure as IStockMovementType
 */
export interface StockMovementDTO {
  id: string;
  deltaQty: number;
  reason: string;
  warehouseId: string;
  occurredAt: Date;
  createdById: string | null;
}

/**
 * Interface for paginated StockMovement results
 */
export interface PaginatedStockMovementsDTO {
  stockMovements: StockMovementDTO[];
  total: number;
  hasMore: boolean;
}
