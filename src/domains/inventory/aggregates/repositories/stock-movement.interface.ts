import { StockMovement, Id, SortBy, SortOrder } from '../value-objects';

/**
 * Repository interface for StockMovement read-only operations.
 * Provides methods for querying historical stock movement data.
 * This repository is append-only and serves as an audit trail.
 * Optimized for GraphQL usage where clients can specify exact filtering needs.
 */
export default interface IStockMovementRepository {
  /**
   * Finds all stock movements with comprehensive filtering, pagination and sorting.
   * Supports all possible query combinations for GraphQL flexibility.
   * @param tenantId - The tenant identifier to scope the search
   * @param options - Optional query parameters for pagination and filtering
   * @param options.page The page number for pagination (e.g., 1 for the first page).
   * @param options.limit The number of items per page.
   * @param options.warehouseId Optional. The warehouse identifier to filter by.
   * @param options.variantId Optional. The product variant identifier to filter by.
   * @param options.createdById Optional. The user identifier who created the movement.
   * @param options.dateFrom Optional. Filter movements from this date.
   * @param options.dateTo Optional. Filter movements until this date.
   * @param options.sortBy Optional. The field to sort by.
   * @param options.sortOrder Optional. The order of sorting ('asc' for ascending, 'desc' for descending).
   * @returns Promise that resolves to stock movements with pagination metadata
   * @throws {Error} When repository operation fails
   */
  findAll(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      warehouseId?: Id;
      variantId?: Id;
      createdById?: Id;
      dateFrom?: Date;
      dateTo?: Date;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
      includeDeleted?: boolean;
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }>;
}
