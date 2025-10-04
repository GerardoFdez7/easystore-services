import { VariantDetailsDTO } from '@shared/dtos';

export interface IProductAdapter {
  getVariantsDetails(
    variantIds: string[],
    search?: string,
  ): Promise<VariantDetailsDTO[]>;
}
