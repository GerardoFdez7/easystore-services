import { Product } from '../entities/product.entity';
import { Id, Name, CategoryId } from '../value-objects/index';

export interface IProductRepository {
  /**
   * Find a product by its ID
   * @param id The product ID
   */
  findById(id: Id): Promise<Product | null>;

  /**
   * Find products by category ID
   * @param categoryId The category ID
   */
  findByCategory(categoryId: CategoryId): Promise<Product[]>;

  /**
   * Find products by name (partial match)
   * @param name The product name to search for
   */
  findByName(name: Name): Promise<Product[]>;

  /**
   * Save a product (create or update)
   * @param product The product to save
   */
  save(product: Product): Promise<Product>;

  /**
   * Delete a product by its ID
   * @param id The product ID
   */
  delete(id: Id): Promise<void>;

  /**
   * Find all products with pagination
   * @param page The page number
   * @param limit The number of items per page
   */
  findAll(
    page: number,
    limit: number,
  ): Promise<{ products: Product[]; total: number }>;
}
