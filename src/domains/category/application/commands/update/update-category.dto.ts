import { ICategoryBase } from '../../../aggregates/entities';

type UpdatableCategoryFields = Partial<Omit<ICategoryBase, 'tenantId'>>;

/**
 * Data Transfer Object for updating a Category
 * Makes all fields from ICategoryBase optional
 */
export class UpdateCategoryDTO {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly data: UpdatableCategoryFields,
  ) {}
}
