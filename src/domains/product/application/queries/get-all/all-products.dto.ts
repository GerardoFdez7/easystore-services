import { SortBy, SortOrder, TypeEnum } from '../../../aggregates/value-objects';

export class GetAllProductsDTO {
  constructor(
    public readonly tenantId: string,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly categoriesIds?: string[],
    public readonly type?: TypeEnum,
    public readonly sortBy?: SortBy,
    public readonly sortOrder?: SortOrder,
    public readonly includeSoftDeleted?: boolean,
  ) {}
}
