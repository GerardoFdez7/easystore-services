import { Category } from '../entities';
import { Id, SortBy, SortOrder } from '../value-objects';

/**
 * Repository interface for Category domain operations.
 * Provides methods for CUD operations and querying categories.
 */
export default interface ICategoryRepository {
  /**
   * Creates a new category in the repository.
   * @param category - The base category data to create
   * @returns Promise that resolves to the created Category entity
   * @throws {Error} When category creation fails
   */
  create(category: Category): Promise<Category>;

  /**
   * Updates an existing category in the repository.
   * @param id - The unique identifier of the category to update
   * @param tenantId - The tenant identifier to scope the search
   * @param updates - Partial category data containing fields to update
   * @returns Promise that resolves to the updated Category entity
   * @throws {Error} When category is not found or update fails
   */
  update(id: Id, tenantId: Id, updates: Category): Promise<Category>;

  /**
   * Deletes a category from the repository.
   * @param id - The unique identifier of the category to delete
   * @param tenantId - The tenant identifier to scope the search
   * @returns Promise that resolves to void when deletion is successful
   * @throws {Error} When category is not found or deletion fails
   */
  delete(id: Id, tenantId: Id): Promise<void>;

  /**
   * Finds a category by its unique identifier.
   * @param id - The unique identifier of the category
   * @param tenantId - The tenant identifier to scope the search
   * @returns Promise that resolves to the Category entity if found, null otherwise
   * @throws {Error} When repository operation fails
   */
  findById(id: Id, tenantId: Id): Promise<Category | null>;

  /**
   * Finds a category by its name within a specific tenant.
   * @param tenantId - The tenant identifier to scope the search
   * @param options - Optional query parameters for pagination and filtering
   * @param options.page The page number for pagination (e.g., 1 for the first page).
   * @param options.limit The number of items per page.
   * @param options.name Optional. The name of the category to search for.
   * @param options.parentId Optional. The unique identifier of the parent category.
   * @param options.includeSubcategories Optional. Whether to include subcategories in the results.
   * @param options.sortBy Optional. The field to sort by.
   * @param options.sortOrder Optional. The order of sorting ('ASC' for ascending, 'DESC' for descending).
   * @returns Promise that resolves to the Category entity if found, null otherwise
   * @throws {Error} When repository operation fails
   */
  findAll(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      parentId?: Id;
      includeSubcategories?: boolean;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ): Promise<{ categories: Category[]; total: number; hasMore: boolean }>;
}
