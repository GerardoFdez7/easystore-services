import { IProductBase } from '../../../../aggregates/entities';

/**
 * Data Transfer Object for creating a new Product
 * Reuses the IProductBase and adds variants as VariantDTO
 */
export class CreateProductDTO {
  constructor(public readonly data: IProductBase) {}
}
