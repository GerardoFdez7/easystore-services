import { VariantDetailsDTO } from '@shared/dtos';

/**
 * Product-query capability required by the Inventory application layer.
 */
export interface IProductAdapter {
  getVariantsDetails(
    variantIds: string[],
    search?: string,
  ): Promise<VariantDetailsDTO[]>;
}
