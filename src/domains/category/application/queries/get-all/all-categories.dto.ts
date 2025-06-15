import { SortBy, SortOrder } from '../../../aggregates/value-objects';

export class GetAllCategoriesDTO {
  constructor(
    public readonly tenantId: string,
    public readonly options?: {
      page?: number;
      limit?: number;
      name?: string;
      parentId?: string;
      includeSubcategories?: boolean;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ) {}
}
