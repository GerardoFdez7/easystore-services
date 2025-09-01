import { SortBy, SortOrder } from '../../../../aggregates/value-objects';

export class GetAllWarehousesDTO {
  constructor(
    public readonly tenantId: string,
    public readonly options?: {
      page?: number;
      limit?: number;
      name?: string;
      addressId?: string;
      variantId?: string;
      lowStockThreshold?: number;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
      isArchived?: boolean;
      includeAddresses?: boolean;
    },
  ) {}
}
