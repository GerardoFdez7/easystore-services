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
   * Update a warehouse
   * @param warehouse The warehouse to update
   * @returns The updated warehouse
   * @throws {Error} If there is an error during the database operation
   */
  updateWarehouse(warehouse: Warehouse): Promise<Warehouse>;

  /**
   * Delete a warehouse and all its associated stock and movements
   * @param tenantId The tenant ID
   * @param warehouseId The warehouse ID
   * @returns The deleted warehouse
   * @throws {Error} If there is an error during the database operation
   */
  deleteWarehouse(tenantId: Id, warehouseId: Id): Promise<Warehouse>;

  /**
   * Get a warehouse by ID
   * @param tenantId The tenant ID
   * @param warehouseId The warehouse ID
   * @returns The warehouse or null if not found
   * @throws {Error} If there is an error during the search
   */
  getWarehouse(tenantId: Id, warehouseId: Id): Promise<Warehouse | null>;

  /**
   * Get all warehouses for a tenant
   * @param tenantId The tenant ID
   * @param options Optional parameters for pagination and filtering
   * @returns Warehouses with pagination info
   * @throws {Error} If there is an error during the search
   */
  getWarehouses(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ warehouses: Warehouse[]; total: number; hasMore: boolean }>;

  // ==================== STOCK OPERATIONS ====================
  
  /**
   * Save stock per warehouse (create or update)
   * @param stockPerWarehouse The stock to save
   * @returns The saved stock
   * @throws {Error} If there is an error during the database operation
   */
  saveStock(stockPerWarehouse: StockPerWarehouse): Promise<StockPerWarehouse>;

  /**
   * Update stock per warehouse
   * @param stockPerWarehouse The stock to update
   * @returns The updated stock
   * @throws {Error} If there is an error during the database operation
   */
  updateStock(stockPerWarehouse: StockPerWarehouse): Promise<StockPerWarehouse>;

  /**
   * Delete stock per warehouse
   * @param tenantId The tenant ID
   * @param stockId The stock ID
   * @returns The deleted stock
   * @throws {Error} If there is an error during the database operation
   */
  deleteStock(tenantId: Id, stockId: Id): Promise<StockPerWarehouse>;

  /**
   * Get stock by ID
   * @param tenantId The tenant ID
   * @param stockId The stock ID
   * @returns The stock or null if not found
   * @throws {Error} If there is an error during the search
   */
  getStock(tenantId: Id, stockId: Id): Promise<StockPerWarehouse | null>;

  /**
   * Get stock by variant and warehouse
   * @param tenantId The tenant ID
   * @param variantId The variant ID
   * @param warehouseId The warehouse ID
   * @returns The stock or null if not found
   * @throws {Error} If there is an error during the search
   */
  getStockByVariantAndWarehouse(
    tenantId: Id,
    variantId: Id,
    warehouseId: Id,
  ): Promise<StockPerWarehouse | null>;

  /**
   * Get all stock for a warehouse
   * @param tenantId The tenant ID
   * @param warehouseId The warehouse ID
   * @param options Optional parameters for filtering and pagination
   * @returns Stock items with pagination info
   * @throws {Error} If there is an error during the search
   */
  getStockByWarehouse(
    tenantId: Id,
    warehouseId: Id,
    options?: {
      page?: number;
      limit?: number;
      lowStock?: boolean;
      outOfStock?: boolean;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ stockItems: StockPerWarehouse[]; total: number; hasMore: boolean }>;

  /**
   * Get all stock for a variant across all warehouses
   * @param tenantId The tenant ID
   * @param variantId The variant ID
   * @param options Optional parameters for filtering and pagination
   * @returns Stock items with pagination info
   * @throws {Error} If there is an error during the search
   */
  getStockByVariant(
    tenantId: Id,
    variantId: Id,
    options?: {
      page?: number;
      limit?: number;
      lowStock?: boolean;
      outOfStock?: boolean;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ stockItems: StockPerWarehouse[]; total: number; hasMore: boolean }>;

  /**
   * Get all stock for a tenant
   * @param tenantId The tenant ID
   * @param options Optional parameters for filtering and pagination
   * @returns Stock items with pagination info
   * @throws {Error} If there is an error during the search
   */
  getAllStock(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      warehouseId?: Id;
      variantId?: Id;
      lowStock?: boolean;
      outOfStock?: boolean;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ stockItems: StockPerWarehouse[]; total: number; hasMore: boolean }>;

  // ==================== STOCK MOVEMENT OPERATIONS ====================
  
  /**
   * Save stock movement
   * @param stockMovement The movement to save
   * @returns The saved movement
   * @throws {Error} If there is an error during the database operation
   */
  saveMovement(stockMovement: StockMovement): Promise<StockMovement>;

  /**
   * Delete stock movement
   * @param tenantId The tenant ID
   * @param movementId The movement ID
   * @returns The deleted movement
   * @throws {Error} If there is an error during the database operation
   */
  deleteMovement(tenantId: Id, movementId: Id): Promise<StockMovement>;

  /**
   * Get movement by ID
   * @param tenantId The tenant ID
   * @param movementId The movement ID
   * @returns The movement or null if not found
   * @throws {Error} If there is an error during the search
   */
  getMovement(tenantId: Id, movementId: Id): Promise<StockMovement | null>;

  /**
   * Get all movements for a warehouse
   * @param tenantId The tenant ID
   * @param warehouseId The warehouse ID
   * @param options Optional parameters for filtering and pagination
   * @returns Movements with pagination info
   * @throws {Error} If there is an error during the search
   */
  getMovementsByWarehouse(
    tenantId: Id,
    warehouseId: Id,
    options?: {
      page?: number;
      limit?: number;
      movementType?: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
      dateFrom?: Date;
      dateTo?: Date;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }>;

  /**
   * Get all movements for a stock item
   * @param tenantId The tenant ID
   * @param stockId The stock ID
   * @param options Optional parameters for filtering and pagination
   * @returns Movements with pagination info
   * @throws {Error} If there is an error during the search
   */
  getMovementsByStock(
    tenantId: Id,
    stockId: Id,
    options?: {
      page?: number;
      limit?: number;
      movementType?: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
      dateFrom?: Date;
      dateTo?: Date;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }>;

  /**
   * Get all movements for a tenant
   * @param tenantId The tenant ID
   * @param options Optional parameters for filtering and pagination
   * @returns Movements with pagination info
   * @throws {Error} If there is an error during the search
   */
  getAllMovements(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      warehouseId?: Id;
      stockId?: Id;
      variantId?: Id;
      movementType?: 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
      createdById?: Id;
      dateFrom?: Date;
      dateTo?: Date;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ movements: StockMovement[]; total: number; hasMore: boolean }>;

  // ==================== INVENTORY MANAGEMENT OPERATIONS ====================
  
  /**
   * Get complete inventory for a warehouse (warehouse + all stock + recent movements)
   * @param tenantId The tenant ID
   * @param warehouseId The warehouse ID
   * @returns Complete inventory information
   * @throws {Error} If there is an error during the search
   */
  getWarehouseInventory(
    tenantId: Id,
    warehouseId: Id,
  ): Promise<{
    warehouse: Warehouse;
    stockItems: StockPerWarehouse[];
    recentMovements: StockMovement[];
    totalStockItems: number;
    totalMovements: number;
  }>;

  /**
   * Get inventory summary for a tenant
   * @param tenantId The tenant ID
   * @returns Inventory summary
   * @throws {Error} If there is an error during the calculation
   */
  getInventorySummary(tenantId: Id): Promise<{
    totalWarehouses: number;
    totalStockItems: number;
    totalMovements: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
  }>;

  /**
   * Get inventory statistics for a tenant
   * @param tenantId The tenant ID
   * @param dateFrom Optional start date
   * @param dateTo Optional end date
   * @returns Inventory statistics
   * @throws {Error} If there is an error during the calculation
   */
  getInventoryStatistics(
    tenantId: Id,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<{
    totalMovements: number;
    totalEntries: number;
    totalExits: number;
    totalAdjustments: number;
    totalQuantityMoved: number;
    averageQuantityPerMovement: number;
    mostActiveWarehouses: Array<{ warehouseId: Id; movementCount: number }>;
    mostMovedVariants: Array<{ variantId: Id; quantityMoved: number }>;
  }>;
} 