import {
  IVariantType,
  IProductBaseType,
  IProductSystemProps,
} from '../../aggregates/entities';

/**
 * Data Transfer Object for Product Variant
 * Reuses the IVariantType to maintain consistency
 */
export type VariantDTO = IVariantType;

/**
 * Data Transfer Object for Product entity
 * Follows the same structure as IProductType but uses VariantDTO for variants
 */
export interface ProductDTO extends IProductBaseType, IProductSystemProps {
  variants?: VariantDTO[];
}

/**
 * Interface for paginated product results
 */
export interface PaginatedProductsDTO {
  products: ProductDTO[];
  total: number;
}
