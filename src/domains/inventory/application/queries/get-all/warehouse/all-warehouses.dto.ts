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
      sortBy?: SortBy;
      sortOrder?: SortOrder;
      includeAddresses?: boolean;
    },
    public readonly stockOptions?: {
      variantId?: string;
      lowStockThreshold?: number;
      isArchived?: boolean;
      stockSortBy?: StockPerWarehouseSortBy;
      search?: string;
    },
  ) {}
}
