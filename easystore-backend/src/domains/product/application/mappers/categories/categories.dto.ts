import {
  IProductCategoriesBase,
  IProductCategoriesSystem,
} from '../../../aggregates/entities';

/**
 * Data Transfer Object for ProductCategories entity
 * Follows the same structure as IProductCategoriesType
 */
export interface ProductCategoriesDTO
  extends IProductCategoriesBase,
    IProductCategoriesSystem {}
