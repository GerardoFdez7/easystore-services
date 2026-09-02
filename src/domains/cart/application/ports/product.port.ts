import { VariantDetailsDTO } from '@shared/application/dtos';

/**
 * Product-query capability required by the Cart application layer.
 */
export interface IProductAdapter {
  getVariantsDetails(
    variantIds: string[],
    tenantId: string,
  ): Promise<VariantDetailsDTO[]>;
}
