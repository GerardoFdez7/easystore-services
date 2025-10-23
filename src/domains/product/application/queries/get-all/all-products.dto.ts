import {
  SortBy,
  SortOrder,
  TypeEnum,
  ProductFilterModeEnum,
} from '../../../aggregates/value-objects';

export class GetAllProductsDTO {
  constructor(
    public readonly tenantId: string,
    public readonly options?: {
      page?: number;
      limit?: number;
      name?: string;
      categoriesIds?: string[];
      type?: TypeEnum;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
      filterMode?: ProductFilterModeEnum;
    },
  ) {}
}
