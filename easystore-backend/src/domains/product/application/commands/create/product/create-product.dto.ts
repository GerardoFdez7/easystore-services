import {
  InstallmentDetailProps,
  SustainabilityAttributesProps,
  WarrantyDetailProps,
  MetadataProps,
} from '../../../../aggregates/value-objects';
import { IProductType } from '../../../../aggregates/entities';
import { VariantDTO } from '../../../mappers/product.dto';

/**
 * Data Transfer Object for creating a new Product
 * Extends from IProductType but omits fields that are generated during creation
 */
export class CreateProductDTO
  implements Omit<IProductType, 'id' | 'createdAt' | 'updatedAt' | 'variants'>
{
  name: string;
  categoryId: string[];
  shortDescription: string;
  longDescription?: string | null;
  variants?: VariantDTO[];
  type: 'PHYSICAL' | 'DIGITAL';
  cover: string;
  media?: string[] | null;
  availableShippingMethods: string[] | null;
  shippingRestrictions: string[] | null;
  tags: string[] | null;
  installmentPayments?: InstallmentDetailProps[] | null;
  acceptedPaymentMethods: string[];
  sustainability?: SustainabilityAttributesProps[] | null;
  brand?: string | null;
  manufacturer?: string | null;
  warranty?: WarrantyDetailProps | null;
  metadata: MetadataProps;
}
