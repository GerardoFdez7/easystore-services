import { Product } from '../entities';
import { Id, Type, SortBy, SortOrder } from '../value-objects/index';

export interface IProductRepository {
  /**
   * Save a product (create or update)
   * @param product The product to save
   * @returns The saved product
   * @throws {Error} If there is an error during the database operation
   */
  save(product: Product): Promise<Product>;

  /**
   * Hard delete a product by its ID (permanent deletion)
   * @param id The product ID
   * @returns The deleted product
   * @throws {Error} If there is an error during the database operation
   */
  hardDelete(tenantId: Id, id: Id): Promise<Product>;

  /**
   * Find a product by its ID
   * @param tenantId The tenant ID
   * @param id The product ID
   * @returns The product or null if not found
   * @throws {Error} If there is an error during the search
   */
  findById(tenantId: Id, id: Id): Promise<Product | null>;

  /**
   * Find all products with pagination, filtering, and sorting.
   *
   * @param tenantId The tenant ID to scope the search.
   * @param options Optional parameters for pagination, filtering, and sorting.
   * @param options.page The page number (default: 1).
   * @param options.limit The number of items per page (default: 10).
   * @param options.name Filter by product name (case-insensitive).
   * @param options.categoriesIds Filter by category IDs.
   * @param options.type Filter by product type.
   * @param options.sortBy The field to sort by (default: 'createdAt').
   * @param options.sortOrder The sort order ('asc' or 'desc') (default: 'desc').
   * @param options.includeSoftDeleted Whether to include soft-deleted products (default: false).
   * @returns A promise that resolves to an object containing the products, total count, and hasMore flag.
   * @throws {Error} If there is an error during the search.
   */
  findAll(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      categoriesIds?: Id[];
      type?: Type;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
      includeSoftDeleted?: boolean;
    },
  ): Promise<{ products: Product[]; total: number; hasMore: boolean }>;
}
