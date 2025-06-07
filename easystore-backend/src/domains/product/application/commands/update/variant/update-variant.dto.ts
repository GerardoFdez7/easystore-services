import {
  IVariantBase,
  IMediaInitData,
  IWarrantyInitData,
  IInstallmentPaymentInitData,
} from '../../../../aggregates/entities';
import {
  AttributeProps,
  DimensionProps,
} from '../../../../aggregates/value-objects';

type UpdatableVariantFields = Partial<
  Omit<
    IVariantBase,
    | 'tenantId'
    | 'productId'
    | 'attributes'
    | 'dimension'
    | 'variantMedia'
    | 'warranties'
    | 'installmentPayments'
  >
> & {
  attributes?: Array<Partial<AttributeProps>>;
} & {
  dimension?: Partial<DimensionProps>;
} & {
  variantMedia?: Array<Partial<IMediaInitData>>;
} & {
  warranties?: Array<Partial<IWarrantyInitData>>;
} & {
  installmentPayments?: Array<Partial<IInstallmentPaymentInitData>>;
};

/**
 * Data Transfer Object for updating a Variant
 * Makes all fields from IVariantBase optional
 */
export class UpdateVariantDTO {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly tenantId: number,
    public readonly data: UpdatableVariantFields,
  ) {}
}
