import { IProductBase } from '../../../../aggregates/entities';

type UpdatableProductFields = Partial<
  Omit<
    IProductBase,
    'tenantId' | 'variants' | 'media' | 'categories' | 'sustainabilities'
  >
>;

/**
 * Data Transfer Object for updating a Product
 * Makes all fields from IProductBase optional
 */
export class UpdateProductDTO {
  constructor(
    public readonly id: number,
    public readonly tenantId: number,
    public readonly data: UpdatableProductFields,
  ) {}
}
