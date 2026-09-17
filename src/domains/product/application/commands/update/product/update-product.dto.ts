import { IProductBase } from '../../../../aggregates/entities';

type UpdatableProductFields = Partial<
  Omit<
    IProductBase,
    'storeId' | 'variants' | 'media' | 'categories' | 'sustainabilities'
  >
>;

/**
 * Data Transfer Object for updating a Product
 * Makes all fields from IProductBase optional
 */
export class UpdateProductDTO {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
    public readonly data: UpdatableProductFields,
  ) {}
}
