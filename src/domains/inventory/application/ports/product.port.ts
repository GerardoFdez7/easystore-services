import { VariantDetailsDTO } from '@domains/dtos';

export default interface IProductAdapter {
  getVariantsDetails(variantIds: string[]): Promise<VariantDetailsDTO[]>;
}
