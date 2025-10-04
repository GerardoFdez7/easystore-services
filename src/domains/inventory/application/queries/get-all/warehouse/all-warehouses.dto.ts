import { SortBy, SortOrder } from '../../../../aggregates/value-objects';

export interface StockPerWarehouseSortBy {
  variantFirstAttribute?: SortOrder;
  available?: SortOrder;
  reserved?: SortOrder;
  date?: SortOrder;
}

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
      stockSortBy?: StockPerWarehouseSortBy;
      search?: string;
    },
  ) {}
}
