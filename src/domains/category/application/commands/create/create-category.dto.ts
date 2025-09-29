import { ICategoryBase } from '../../../aggregates/entities';

/**
 * Data Transfer Object for creating a new Category reuses the ICategoryBase
 */
export class CreateCategoryDTO {
  constructor(
    public readonly data: Omit<ICategoryBase, 'subCategories' | ' id'>,
  ) {}
}
