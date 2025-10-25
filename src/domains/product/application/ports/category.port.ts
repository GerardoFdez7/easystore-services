import { CategoryDTO } from '@shared/dtos';
import { Id } from '../../aggregates/value-objects';

export interface ICategoryAdapter {
  getCategories(tenantId: Id, categoriesIds: string[]): Promise<CategoryDTO[]>;
}
