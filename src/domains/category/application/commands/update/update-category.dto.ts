import { ICategoryBase } from '../../../aggregates/entities';

type UpdatableCategoryFields = Partial<
  Omit<ICategoryBase, 'storeId' | 'subCategories' | 'id'>
>;

/**
 * Data Transfer Object for updating a Category
 * Makes all fields from ICategoryBase optional
 */
export class UpdateCategoryDTO {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
    public readonly data: UpdatableCategoryFields,
  ) {}
}
