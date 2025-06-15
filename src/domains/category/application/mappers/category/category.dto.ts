import { ICategoryType } from '../../../aggregates/entities';

/**
 * Data Transfer Object for Category entity
 * Follows the same structure as ICategoryType
 */
export type CategoryDTO = ICategoryType;

/**
 * Interface for paginated category results
 */
export interface PaginatedCategoriesDTO {
  categories: CategoryDTO[];
  total: number;
  hasMore: boolean;
}
