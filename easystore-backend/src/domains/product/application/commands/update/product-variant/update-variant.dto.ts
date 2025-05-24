import { IVariantBase } from '../../../../aggregates/entities';

type UpdatableVariantFields = Partial<
  Omit<
    IVariantBase,
    'tenantId' | 'productId' | 'media' | 'warranties' | 'installmentPayments'
  >
>;

/**
 * Data Transfer Object for updating a Variant
 * Makes all fields from IVariantBase optional
 */
export class UpdateVariantDTO {
  constructor(
    public readonly id: number,
    public readonly data: UpdatableVariantFields,
    public readonly productId: number,
    public readonly tenantId: number,
  ) {}
}
