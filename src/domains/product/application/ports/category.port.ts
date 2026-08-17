import { CategoryDTO } from '@shared/dtos';
import { Id } from '../../aggregates/value-objects';

/**
 * Category-query capability required by the Product application layer.
 */
export interface ICategoryAdapter {
  getCategories(tenantId: Id, categoriesIds: string[]): Promise<CategoryDTO[]>;
}
