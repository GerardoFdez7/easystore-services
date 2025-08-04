import { SortBy, SortOrder } from '../../../../aggregates/value-objects';

export class GetAllStockMovementsDTO {
  constructor(
    public readonly tenantId: string,
    public readonly options?: {
      page?: number;
      limit?: number;
      warehouseId?: string;
      variantId?: string;
      createdById?: string;
      dateFrom?: Date;
      dateTo?: Date;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
    },
  ) {}
}
