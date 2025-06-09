import { IProductType } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Product entity
 * Follows the same structure as IProductType
 */
export type ProductDTO = IProductType;

/**
 * Interface for paginated product results
 */
export interface PaginatedProductsDTO {
  products: ProductDTO[];
  total: number;
}
