import { VariantDetailsDTO } from '@domains/dtos';

export interface IProductAdapter {
  getVariantsDetails(variantIds: string[]): Promise<VariantDetailsDTO[]>;
}
