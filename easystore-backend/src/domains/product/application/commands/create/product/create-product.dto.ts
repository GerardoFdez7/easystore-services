import { IProductBase } from '../../../../aggregates/entities';

/**
 * Data Transfer Object for creating a new Product reuses the IProductBase
 */
export class CreateProductDTO {
  constructor(public readonly data: IProductBase) {}
}
