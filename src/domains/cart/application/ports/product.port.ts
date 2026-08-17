import { VariantDetailsDTO } from '@shared/dtos';

/**
 * Product-query capability required by the Cart application layer.
 */
export interface IProductAdapter {
  getVariantsDetails(variantIds: string[]): Promise<VariantDetailsDTO[]>;
}
