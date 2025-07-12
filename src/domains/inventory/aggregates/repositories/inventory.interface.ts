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

  
} 