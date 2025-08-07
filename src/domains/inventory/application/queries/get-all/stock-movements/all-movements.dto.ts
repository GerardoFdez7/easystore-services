import { SortBy, SortOrder } from '../../../../aggregates/value-objects';

export class GetAllStockMovementsDTO {
  constructor(
    public readonly warehouseId?: string,
    public readonly options?: {
      page?: number;
      limit?: number;
      variantId?: string;
      createdById?: string;
      dateFrom?: Date;
      dateTo?: Date;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
      includeDeleted?: boolean;
    },
  ) {}
}
