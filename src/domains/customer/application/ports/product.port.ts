import { VariantDetailsDTO } from '@shared/application/dtos';

/** Product-variant lookup capability required by the Customer application layer. */
export interface IProductAdapter {
  getVariantsDetails(variantIds: string[]): Promise<VariantDetailsDTO[]>;
}
