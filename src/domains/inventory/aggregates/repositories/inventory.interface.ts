import { Warehouse, StockPerWarehouse, StockMovement } from '../entities';
import { Id, SortBy, SortOrder } from '@domains/value-objects';
import { IStockPerWarehouseBase } from '../entities/stockPerWarehouse/stock-per-warehouse.attributes';

export interface IInventoryRepository {
  // ==================== WAREHOUSE OPERATIONS ====================
  
  /**
   * Save a warehouse (create or update)
   * @param warehouse The warehouse to save
   * @returns The saved warehouse
   * @throws {Error} If there is an error during the database operation
   */
  saveWarehouse(warehouse: Warehouse): Promise<Warehouse>;

  /**
   * Get a warehouse by its ID
   * @param id The warehouse ID to find
   * @returns The warehouse or null if not found
   * @throws {Error} If there is an error during the database operation
   */
  getWarehouseById(id: string): Promise<Warehouse | null>;

  /**
   * Get all warehouses
   * @returns Array of all warehouses
   * @throws {Error} If there is an error during the database operation
   */
  getAllWarehouses(): Promise<Warehouse[]>;

  /**
   * Update a warehouse by its ID
   * @param id The warehouse ID to update
   * @param warehouse The warehouse data to update
   * @returns The updated warehouse
   * @throws {Error} If there is an error during the database operation
   */
  updateWarehouse(id: string, warehouse: Warehouse): Promise<Warehouse>;

  /**
   * Delete a warehouse by its ID
   * @param id The warehouse ID to delete
   * @returns The deleted warehouse
   * @throws {Error} If there is an error during the database operation
   */
  deleteWarehouse(id: string): Promise<Warehouse>;

  // ==================== STOCK PER WAREHOUSE OPERATIONS ====================
  
  /**
   * Save a stock per warehouse (create or update)
   * @param stockPerWarehouse The stock per warehouse to save
   * @returns The saved stock per warehouse
   * @throws {Error} If there is an error during the database operation
   */
  saveStockPerWarehouse(stockPerWarehouse: StockPerWarehouse): Promise<StockPerWarehouse>;

  /**
   * Delete a stock per warehouse by its ID
   * @param id The stock per warehouse ID to delete
   * @returns The deleted stock per warehouse
   * @throws {Error} If there is an error during the database operation
   */
  deleteStockPerWarehouse(id: string): Promise<StockPerWarehouse>;

  /**
   * Get a stock per warehouse by its ID
   * @param id The stock per warehouse ID to find
   * @returns The stock per warehouse or null if not found
   * @throws {Error} If there is an error during the database operation
   */
  getStockPerWarehouseById(id: string): Promise<StockPerWarehouse | null>;

  /**
   * Get all stock per warehouse by warehouseId
   * @param warehouseId The warehouse ID to filter by
   * @returns Array of stock per warehouse
   * @throws {Error} If there is an error during the database operation
   */
  getAllStockPerWarehouseByWarehouseId(warehouseId: string): Promise<StockPerWarehouse[]>;
  
  /**
   * Update a stock per warehouse by its ID
   * @param id The stock per warehouse ID to update
   * @param updates The fields to update
   * @returns The updated stock per warehouse
   * @throws {Error} If there is an error during the database operation
   */
  updateStockPerWarehouse(id: string, updates: Partial<IStockPerWarehouseBase>): Promise<StockPerWarehouse>;
  
} 