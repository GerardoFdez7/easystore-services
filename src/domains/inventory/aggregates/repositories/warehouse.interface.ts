import { Warehouse } from '../entities';
import { Id } from '@domains/value-objects';

/**
 * Repository interface for Warehouse aggregate operations.
 * Provides methods for CRUD operations and querying warehouses.
 * All stock operations must go through Warehouse aggregate methods.
 */
export default interface IWarehouseRepository {
  /**
   * Creates a new warehouse in the repository.
   * @param warehouse - The warehouse entity to create
   * @returns Promise that resolves to the created Warehouse entity
   * @throws {Error} When warehouse creation fails
   */
  create(warehouse: Warehouse): Promise<Warehouse>;

  /**
   * Updates an existing warehouse in the repository.
   * @param id - The unique identifier of the warehouse to update
   * @param tenantId - The tenant identifier to scope the search
   * @param updates - Warehouse entity containing fields to update
   * @returns Promise that resolves to the updated Warehouse entity
   * @throws {Error} When warehouse is not found or update fails
   */
  update(id: Id, tenantId: Id, updates: Warehouse): Promise<Warehouse>;

  /**
   * Deletes a warehouse from the repository.
   * @param id - The unique identifier of the warehouse to delete
   * @param tenantId - The tenant identifier to scope the search
   * @returns Promise that resolves to void when deletion is successful
   * @throws {Error} When warehouse is not found or deletion fails
   */
  delete(id: Id, tenantId: Id): Promise<void>;

  /**
   * Finds a warehouse by its unique identifier.
   * @param id - The unique identifier of the warehouse
   * @param tenantId - The tenant identifier to scope the search
   * @returns Promise that resolves to the Warehouse entity if found, null otherwise
   * @throws {Error} When repository operation fails
   */
  findById(id: Id, tenantId: Id): Promise<Warehouse | null>;

  /**
   * Finds warehouses by tenant with pagination, filtering, and sorting.
   * @param tenantId - The tenant identifier to scope the search
   * @param options - Optional query parameters for pagination and filtering
   * @param options.page The page number for pagination (e.g., 1 for the first page).
   * @param options.limit The number of items per page.
   * @param options.name Optional. The name of the warehouse to search for.
   * @param options.addressId Optional. The address identifier to filter by.
   * @param options.sortBy Optional. The field to sort by.
   * @param options.sortOrder Optional. The order of sorting ('asc' for ascending, 'desc' for descending).
   * @returns Promise that resolves to warehouses with pagination metadata
   * @throws {Error} When repository operation fails
   */
  findAll(
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

  /**
   * Finds a warehouse with its stock by product variant.
   * @param tenantId - The tenant identifier to scope the search
   * @param variantId - The product variant identifier
   * @returns Promise that resolves to warehouses containing the specified variant
   * @throws {Error} When repository operation fails
   */
  findWithStockByVariant(tenantId: Id, variantId: Id): Promise<Warehouse[]>;

  /**
   * Finds warehouses with low stock levels.
   * @param tenantId - The tenant identifier to scope the search
   * @param threshold - The minimum stock threshold
   * @returns Promise that resolves to warehouses with low stock
   * @throws {Error} When repository operation fails
   */
  findWithLowStock(tenantId: Id, threshold: number): Promise<Warehouse[]>;
}
