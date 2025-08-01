import { StockMovement, Id } from '../value-objects';

/**
 * Repository interface for StockMovement read-only operations.
 * Provides methods for querying historical stock movement data.
 * This repository is append-only and serves as an audit trail.
 */
export default interface IStockMovementRepository {
  /**
   * Finds all stock movements with pagination and filtering.
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
      createdById?: string;
      dateFrom?: Date;
      dateTo?: Date;
      sortBy?: 'occurredAt' | 'deltaQty';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }>;

  /**
   * Finds stock movements by warehouse identifier.
   * @param tenantId - The tenant identifier to scope the search
   * @param warehouseId - The warehouse identifier
   * @param options - Optional query parameters for pagination
   * @param options.page The page number for pagination (e.g., 1 for the first page).
   * @param options.limit The number of items per page.
   * @param options.sortOrder Optional. The order of sorting ('asc' for ascending, 'desc' for descending).
   * @returns Promise that resolves to stock movements for the warehouse
   * @throws {Error} When repository operation fails
   */
  findByWarehouse(
    tenantId: Id,
    warehouseId: Id,
    options?: {
      page?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }>;

  /**
   * Finds stock movements by product variant identifier.
   * @param tenantId - The tenant identifier to scope the search
   * @param variantId - The product variant identifier
   * @param options - Optional query parameters for pagination
   * @param options.page The page number for pagination (e.g., 1 for the first page).
   * @param options.limit The number of items per page.
   * @param options.sortOrder Optional. The order of sorting ('asc' for ascending, 'desc' for descending).
   * @returns Promise that resolves to stock movements for the product variant
   * @throws {Error} When repository operation fails
   */
  findByProductVariant(
    tenantId: Id,
    variantId: Id,
    options?: {
      page?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }>;

  /**
   * Finds stock movements by user who created them.
   * @param tenantId - The tenant identifier to scope the search
   * @param createdById - The user identifier who created the movements
   * @param options - Optional query parameters for pagination
   * @param options.page The page number for pagination (e.g., 1 for the first page).
   * @param options.limit The number of items per page.
   * @param options.sortOrder Optional. The order of sorting ('asc' for ascending, 'desc' for descending).
   * @returns Promise that resolves to stock movements created by the user
   * @throws {Error} When repository operation fails
   */
  findByCreatedBy(
    tenantId: Id,
    createdById: string,
    options?: {
      page?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }>;

  /**
   * Finds stock movements within a date range.
   * @param tenantId - The tenant identifier to scope the search
   * @param dateFrom - Start date for the range
   * @param dateTo - End date for the range
   * @param options - Optional query parameters for pagination
   * @param options.page The page number for pagination (e.g., 1 for the first page).
   * @param options.limit The number of items per page.
   * @param options.sortOrder Optional. The order of sorting ('asc' for ascending, 'desc' for descending).
   * @returns Promise that resolves to stock movements within the date range
   * @throws {Error} When repository operation fails
   */
  findByDateRange(
    tenantId: Id,
    dateFrom: Date,
    dateTo: Date,
    options?: {
      page?: number;
      limit?: number;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }>;
}
