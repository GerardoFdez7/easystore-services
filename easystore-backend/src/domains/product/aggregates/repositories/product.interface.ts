import { Product } from '../entities/product.entity';
import { Id, Name, CategoryId } from '../value-objects/index';

export interface IProductRepository {
  /**
   * Save a product (create or update)
   * @param product The product to save
   */
  save(product: Product): Promise<Product>;

  /**
   * Soft delete a product by its ID
   * @param id The product ID
   */
  softDelete(id: Id): Promise<void>;

  /**
   * Hard delete a product by its ID (permanent deletion)
   * @param id The product ID
   */
  hardDelete(id: Id): Promise<void>;

  /**
   * Restore a soft-deleted product
   * @param id The product ID
   */
  restore(id: Id): Promise<void>;

  /**
   * Find a product by its ID
   * @param id The product ID
   * @param includeSoftDeleted Whether to include soft-deleted products (default: false)
   */
  findById(id: Id, includeSoftDeleted?: boolean): Promise<Product | null>;

  /**
   * Find products by name (partial match)
   * @param name The product name to search for
   * @param includeSoftDeleted Whether to include soft-deleted products (default: false)
   */
  findByName(name: Name, includeSoftDeleted?: boolean): Promise<Product[]>;

  /**
   * Find all products with pagination, including option to include soft-deleted items
   * @param page The page number
   * @param limit The number of items per page
   * @param includeSoftDeleted Whether to include soft-deleted products
   * @param categoryId Optional category ID to filter products by category
   */
  findAll(
    page: number,
    limit: number,
    categoryId?: CategoryId,
    includeSoftDeleted?: boolean,
  ): Promise<{ products: Product[]; total: number }>;
}
