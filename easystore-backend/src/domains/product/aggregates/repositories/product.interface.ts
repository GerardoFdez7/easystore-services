import { Product } from '../entities';
import { Id, Name, Type, SortBy, SortOrder } from '../value-objects/index';

export interface IProductRepository {
  /**
   * Save a product (create or update)
   * @param product The product to save
   */
  save(product: Product): Promise<Product>;

  /**
   * Soft delete a product by its ID
   * @param tenantId The tenant ID
   * @param id The product ID
   */
  softDelete(tenantId: Id, id: Id): Promise<void>;

  /**
   * Hard delete a product by its ID (permanent deletion)
   * @param id The product ID
   */
  hardDelete(id: Id): Promise<void>;

  /**
   * Restore a soft-deleted product
   * @param tenantId The tenant ID
   * @param id The product ID
   */
  restore(tenantId: Id, id: Id): Promise<void>;

  /**
   * Find a product by its ID
   * @param tenantId The tenant ID
   * @param id The product ID
   */
  findById(tenantId: Id, id: Id): Promise<Product | null>;

  /**
   * Find products by name (partial match)
   * @param name The product name to search for
   * @param tenantId The tenant ID
   * @param includeSoftDeleted Whether to include soft-deleted products (default: false)
   */
  findByName(
    name: Name,
    tenantId: Id,
    includeSoftDeleted?: boolean,
  ): Promise<Product[]>;

  /**
   * Find all products with pagination, filtering, and sorting.
   *
   * @param tenantId The tenant ID
   * @param page The page number for pagination (e.g., 1 for the first page).
   * @param limit The number of items per page.
   * @param categoriesIds Optional. An array of category IDs (Value Object `Id`) to filter products by.
   *                      If provided, only products belonging to at least one of these categories will be returned.
   * @param Types Optional. A `Type` value object to filter products by its specific type (e.g., PHYSICAL or DIGITAL).
   *                     If provided, only.
   * @param sortBy Optional. The field to sort the products by.
   *               Supported fields: 'createdAt', 'updatedAt', 'name'.
   *               Defaults to a predefined order (e.g., 'createdAt') if not specified.
   * @param sortOrder Optional. The order of sorting ('ASC' for ascending, 'DESC' for descending).
   *                  Defaults to 'DESC' for date fields and 'ASC' for text fields like 'name' if not specified.
   *                  This parameter is typically used in conjunction with `sortBy`.
   * @param includeSoftDeleted Optional. Whether to include soft-deleted products in the results.
   *                           Defaults to `false`.
   * @returns A promise that resolves to an object containing an array of `Product` entities
   *          for the current page and the `total` number of products matching the criteria.
   */
  findAll(
    tenantId: Id,
    page?: number,
    limit?: number,
    categoriesIds?: Id[],
    type?: Type,
    sortBy?: SortBy,
    sortOrder?: SortOrder,
    includeSoftDeleted?: boolean,
  ): Promise<{ products: Product[]; total: number }>;
}
