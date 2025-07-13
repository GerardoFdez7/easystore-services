import { Warehouse, StockPerWarehouse, StockMovement } from '../entities';
import { Id, SortBy, SortOrder } from '@domains/value-objects';

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
  
} 