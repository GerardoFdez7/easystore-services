import {
  AttributeProps,
  DimensionProps,
  ConditionEnum,
} from '../../value-objects';
import {
  IMediaBase,
  IWarrantyBase,
  IInstallmentPaymentBase,
  IMediaType,
  IWarrantyType,
  IInstallmentPaymentType,
} from '../';

export interface IVariantBase {
  attributes: AttributeProps[];
  price: number;
  variantCover: string;
  personalizationOptions: string[];
  weight?: number | null;
  dimension?: DimensionProps | null;
  condition: ConditionEnum;
  upc?: string | null;
  ean?: string | null;
  sku?: string | null;
  barcode?: string | null;
  isbn?: string | null;
  productId: number;
  tenantId: number;
  media: IMediaInitData[];
  warranties: IWarrantyInitData[];
  installmentPayments: IInstallmentPaymentInitData[];
}

export interface IVariantSystem {
  id: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface IVariantType extends IVariantSystem {
  attributes: AttributeProps[];
  price: number;
  variantCover: string;
  personalizationOptions: string[];
  weight?: number | null;
  dimension?: DimensionProps | null;
  condition: ConditionEnum;
  upc?: string | null;
  ean?: string | null;
  sku?: string | null;
  barcode?: string | null;
  isbn?: string | null;
  productId: number;
  tenantId: number;
  media: IMediaType[];
  warranties: IWarrantyType[];
  installmentPayments: IInstallmentPaymentType[];
}

export type IMediaInitData = Omit<IMediaBase, 'productId' | 'variantId'>;
export type IWarrantyInitData = Omit<IWarrantyBase, 'variantId'>;
export type IInstallmentPaymentInitData = Omit<
  IInstallmentPaymentBase,
  'variantId'
>;
