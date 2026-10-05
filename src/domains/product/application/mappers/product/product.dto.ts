import { IProductType } from '../../../aggregates/entities';
import { VariantReadDTO } from '../variant/variant.dto';

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
  hasMore: boolean;
}

/**
 * Read model for Product returned to the presentation layer (variants carry Money).
 */
export type ProductReadDTO = Omit<ProductDTO, 'variants'> & {
  variants: VariantReadDTO[];
};

export interface PaginatedProductsReadDTO {
  products: ProductReadDTO[];
  total: number;
  hasMore: boolean;
}
