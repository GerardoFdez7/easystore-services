import {
  AttributeProps,
  InstallmentDetailProps,
  SustainabilityAttributesProps,
  WarrantyDetailProps,
  DimensionProps,
  StockPerWarehouseProps,
  MetadataProps,
} from '../value-objects';

// Base product properties shared across all product-related types
export interface IProductBaseType {
  name: string;
  categoryId?: string[];
  shortDescription?: string;
  longDescription?: string | null;
  type?: 'PHYSICAL' | 'DIGITAL';
  cover?: string | null;
  media?: string[];
  availableShippingMethods?: string[];
  shippingRestrictions?: string[];
  tags?: string[];
  installmentPayments?: InstallmentDetailProps[];
  acceptedPaymentMethods?: string[];
  sustainability?: SustainabilityAttributesProps[];
  brand?: string | null;
  manufacturer?: string | null;
  warranty?: WarrantyDetailProps | null;
}

// System-generated properties for a product
export interface IProductSystemProps {
  id: string;
  metadata: MetadataProps;
  createdAt: Date;
  updatedAt: Date;
}

// Complete product type combining base properties, system properties, and variants
export interface IProductType extends IProductBaseType, IProductSystemProps {
  variants: IVariantType[];
}

export interface IVariantType {
  attributes: Array<AttributeProps>;
  stockPerWarehouse: Array<StockPerWarehouseProps>;
  price: number;
  currency: string;
  variantMedia?: string[];
  personalizationOptions?: string[];
  weight?: number | null;
  dimensions?: DimensionProps | null;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  sku?: string | null;
  upc?: string | null;
  ean?: string | null;
  isbn?: string | null;
  barcode?: string | null;
}
