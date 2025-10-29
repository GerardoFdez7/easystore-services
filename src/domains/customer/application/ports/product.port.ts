import { VariantDetailsDTO } from '@shared/dtos';

export interface IProductAdapter {
  getVariantsDetails(variantIds: string[]): Promise<VariantDetailsDTO[]>;
}
