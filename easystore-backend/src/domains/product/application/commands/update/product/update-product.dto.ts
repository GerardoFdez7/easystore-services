import {
  InstallmentDetailProps,
  SustainabilityAttributesProps,
  WarrantyDetailProps,
} from '../../../../aggregates/value-objects';
import { IProductBaseType } from '../../../../aggregates/entities';
import { VariantDTO } from '../../../mappers/product.dto';

/**
 * Data Transfer Object for updating a Product
 * Makes all fields from IProductBaseType optional except id
 */
export class UpdateProductDTO {
  id: string;
  name?: string | null;
  categoryId?: string[];
  shortDescription?: string;
  longDescription?: string | null;
  variants?: VariantDTO[];
  type?: 'PHYSICAL' | 'DIGITAL';
  cover?: string | null;
  media?: string[] | null;
  availableShippingMethods?: string[];
  shippingRestrictions?: string[] | null;
  tags?: string[] | null;
  installmentPayments?: InstallmentDetailProps[] | null;
  acceptedPaymentMethods?: string[];
  sustainability?: SustainabilityAttributesProps[] | null;
  brand?: string | null;
  manufacturer?: string | null;
  warranty?: WarrantyDetailProps | null;

  constructor(
    data: { id: string } & Partial<IProductBaseType> & {
        variants?: VariantDTO[];
      },
  ) {
    Object.assign(this, data);
  }
}
