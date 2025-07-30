import { Warehouse, StockPerWarehouse } from '../entities';
import { IStockPerWarehouseBase } from '../entities/stockPerWarehouse/stock-per-warehouse.attributes';
import { Id } from '@domains/value-objects';

export interface IInventoryRepository {
  // ==================== WAREHOUSE OPERATIONS ====================

  /**
   * Create a warehouse
   * @param warehouse The warehouse to save
   * @returns The saved warehouse
   * @throws {Error} If there is an error during the database operation
   */
  createWarehouse(warehouse: Warehouse): Promise<Warehouse>;

  /**
   * Get a warehouse by its ID
   * @param id The warehouse ID to find
   * @returns The warehouse or null if not found
   * @throws {Error} If there is an error during the database operation
   */
  getWarehouseById(id: Id): Promise<Warehouse | null>;

  /**
   * Update a warehouse by its ID
   * @param id The warehouse ID to update
   * @param warehouse The warehouse data to update
   * @returns The updated warehouse
   * @throws {Error} If there is an error during the database operation
   */
  updateWarehouse(
    id: Id,
    tenantId: Id,
    warehouse: Warehouse,
  ): Promise<Warehouse>;

  /**
   * Delete a warehouse by its ID
   * @param id The warehouse ID to delete
   * @returns The deleted warehouse
   * @throws {Error} If there is an error during the database operation
   */
  deleteWarehouse(id: Id, tenantId: Id): Promise<Warehouse>;

  /**
   * Find all warehouses for a tenant with pagination, filtering, and sorting options.
   * @param tenantId The tenant ID to scope the search.
   * @param options Optional parameters for pagination, filtering, and sorting.
   * @returns A promise with warehouses, total count, and hasMore flag.
   */
  findAllWarehouses(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      addressId?: Id;
      sortBy?: 'createdAt' | 'name' | 'addressId';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{ warehouses: Warehouse[]; total: number; hasMore: boolean }>;

  // ==================== STOCK PER WAREHOUSE OPERATIONS ====================

  /**
   * Save a stock per warehouse
   * @param stockPerWarehouse The stock per warehouse to save
   * @returns The saved stock per warehouse
   * @throws {Error} If there is an error during the database operation
   */
  createStockPerWarehouse(
    stockPerWarehouse: StockPerWarehouse,
  ): Promise<StockPerWarehouse>;

  /**
   * Delete a stock per warehouse by its ID
   * @param id The stock per warehouse ID to delete
   * @returns The deleted stock per warehouse
   * @throws {Error} If there is an error during the database operation
   */
  deleteStockPerWarehouse(id: Id, warehouseId: Id): Promise<StockPerWarehouse>;

  /**
   * Get a stock per warehouse by its ID
   * @param id The stock per warehouse ID to find
   * @returns The stock per warehouse or null if not found
   * @throws {Error} If there is an error during the database operation
   */
  getStockPerWarehouseById(
    id: Id,
    warehouseId: Id,
  ): Promise<StockPerWarehouse | null>;

  /**
   * Get all stock per warehouse by warehouseId
   * @param warehouseId The warehouse ID to filter by
   * @returns Array of stock per warehouse
   * @throws {Error} If there is an error during the database operation
   */
  getAllStockPerWarehouseByWarehouseId(
    warehouseId: string,
  ): Promise<StockPerWarehouse[]>;

  /**
   * Update a stock per warehouse by its ID
   * @param id The stock per warehouse ID to update
   * @param updates The fields to update
   * @returns The updated stock per warehouse
   * @throws {Error} If there is an error during the database operation
   */
  updateStockPerWarehouse(
    id: Id,
    warehouseId: Id,
    updates: Partial<IStockPerWarehouseBase>,
  ): Promise<StockPerWarehouse>;
}
