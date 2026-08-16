/**
 * Data Transfer Object for StockMovement entity
 */
export interface StockMovementDTO {
  id: string;
  deltaQty: number;
  reason: string;
  warehouseId: string;
  occurredAt: Date;
  createdById: string | null;
  variantId?: string;
  productName?: string;
  variantSku?: string;
  variantFirstAttribute?: {
    key: string;
    value: string;
  };
}

/**
 * Interface for paginated StockMovement results
 */
export interface PaginatedStockMovementsDTO {
  stockMovements: StockMovementDTO[];
  total: number;
  hasMore: boolean;
}
