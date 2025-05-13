import {
  InstallmentDetailProps,
  SustainabilityAttributesProps,
  WarrantyDetailProps,
} from '../../../../aggregates/value-objects';
import { IProductBaseType } from '../../../../aggregates/entities';
import { VariantDTO } from '../../../mappers';

/**
 * Data Transfer Object for creating a new Product
 * Reuses the IProductBaseType and adds variants as VariantDTO
 */
export class CreateProductDTO implements IProductBaseType {
  name: string;
  categoryId?: string[];
  shortDescription: string;
  longDescription?: string | undefined;
  variants: VariantDTO[];
  type: 'PHYSICAL' | 'DIGITAL';
  cover?: string | undefined;
  media?: string[];
  availableShippingMethods?: string[];
  shippingRestrictions?: string[];
  tags?: string[];
  installmentPayments?: InstallmentDetailProps[];
  acceptedPaymentMethods: string[];
  sustainability?: SustainabilityAttributesProps[];
  brand?: string | undefined;
  manufacturer?: string | undefined;
  warranty?: WarrantyDetailProps | undefined;

  constructor(
    public readonly data: IProductBaseType & { variants?: VariantDTO[] },
  ) {
    Object.assign(this, data);
  }
}
