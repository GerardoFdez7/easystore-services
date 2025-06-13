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
    public readonly id: string,
    public readonly tenantId: string,
    public readonly data: UpdatableProductFields,
  ) {}
}
