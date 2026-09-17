import { VariantDetailsDTO } from '@shared/application/dtos';

/**
 * Product-query capability required by the Inventory application layer.
 */
export interface IProductAdapter {
  getVariantsDetails(
    variantIds: string[],
    storeId: string,
    search?: string,
  ): Promise<VariantDetailsDTO[]>;
}
