import {
  InstallmentDetailProps,
  SustainabilityAttributesProps,
  WarrantyDetailProps,
  MetadataProps,
} from '../../../../aggregates/value-objects';
import { IProductType } from '../../../../aggregates/entities';
import { VariantDTO } from '../../../mappers/product.dto';

/**
 * Data Transfer Object for updating a Product
 * Extends from IProductType but makes all fields optional except id
 * and omits fields that should not be updated directly
 */
export class UpdateProductDTO
  implements Partial<Omit<IProductType, 'createdAt' | 'updatedAt' | 'variants'>>
{
  id: string;
  name?: string;
  categoryId?: string[];
  shortDescription?: string;
  longDescription?: string | null;
  variants?: VariantDTO[];
  type?: 'PHYSICAL' | 'DIGITAL';
  cover?: string;
  media?: string[] | null;
  availableShippingMethods?: string[] | null;
  shippingRestrictions?: string[] | null;
  tags?: string[] | null;
  installmentPayments?: InstallmentDetailProps[] | null;
  acceptedPaymentMethods?: string[];
  sustainability?: SustainabilityAttributesProps[] | null;
  brand?: string | null;
  manufacturer?: string | null;
  warranty?: WarrantyDetailProps | null;
  metadata?: MetadataProps;
}
