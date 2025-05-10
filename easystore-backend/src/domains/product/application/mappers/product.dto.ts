import {
  AttributeProps,
  DimensionProps,
  StockPerWarehouseProps,
} from '../../aggregates/value-objects';
import { IProductType } from '../../aggregates/entities';

/**
 * Data Transfer Object for Product entity
 * Follows the same structure as IProductType to maintain consistency
 * between the domain model and the API responses
 */
export interface ProductDTO extends Omit<IProductType, 'variants'> {
  variants?: VariantDTO[];
}

/**
 * Data Transfer Object for Product Variant
 * Mirrors the IVariantType structure but with flattened properties
 * for API consumption
 */
export interface VariantDTO {
  attributes: Array<AttributeProps>;
  stockPerWarehouse: Array<StockPerWarehouseProps>;
  price: number;
  currency: string;
  variantMedia?: string[];
  personalizationOptions?: string[];
  weight?: number;
  dimensions?: DimensionProps;
  condition: string;
  sku?: string;
  upc?: string;
  ean?: string;
  isbn?: string;
  barcode?: string;
}

/**
 * Interface for paginated product results
 */
export interface PaginatedProductsDTO {
  products: ProductDTO[];
  total: number;
}
