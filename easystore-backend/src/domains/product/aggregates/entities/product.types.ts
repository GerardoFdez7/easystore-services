import {
  AttributeProps,
  InstallmentDetailProps,
  SustainabilityAttributesProps,
  WarrantyDetailProps,
  DimensionProps,
  StockPerWarehouseProps,
  MetadataProps,
} from '../value-objects';

export interface IProductType {
  id: string;
  name: string;
  categoryId: string[];
  shortDescription: string;
  longDescription?: string | null;
  variants?: IVariantType[];
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IVariantType {
  attributes: Array<AttributeProps>;
  stockPerWarehouse: Array<StockPerWarehouseProps>;
  price: number;
  currency: string;
  variantMedia?: string[];
  personalizationOptions?: string[];
  weight?: number;
  dimensions?: DimensionProps;
  condition: string;
  sku?: string;
  upc?: string;
  ean?: string;
  isbn?: string;
  barcode?: string;
}
