import { IProductBase, IProductSystem } from '../../aggregates/entities';

/**
 * Data Transfer Object for Product entity
 * Follows the same structure as IProductType but uses VariantDTO for variants
 */
export interface ProductDTO extends IProductBase, IProductSystem {}

/**
 * Interface for paginated product results
 */
export interface PaginatedProductsDTO {
  products: ProductDTO[];
  total: number;
}
