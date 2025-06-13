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
  variantCover?: string;
  personalizationOptions?: string[];
  weight?: number;
  dimension?: DimensionProps;
  condition: ConditionEnum;
  upc?: string;
  ean?: string;
  sku?: string;
  barcode?: string;
  isbn?: string;
  productId: string;
  tenantId: string;
  variantMedia?: IMediaInitData[];
  warranties?: IWarrantyInitData[];
  installmentPayments?: IInstallmentPaymentInitData[];
}

export interface IVariantSystem {
  id: string;
  isArchived: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export interface IVariantType extends IVariantSystem {
  attributes: AttributeProps[];
  price: number;
  variantCover?: string;
  personalizationOptions: string[];
  weight?: number;
  dimension?: DimensionProps;
  condition: ConditionEnum;
  upc?: string;
  ean?: string;
  sku?: string;
  barcode?: string;
  isbn?: string;
  productId: string;
  tenantId: string;
  variantMedia: IMediaType[];
  warranties: IWarrantyType[];
  installmentPayments: IInstallmentPaymentType[];
}

export type IMediaInitData = Omit<IMediaBase, 'productId' | 'variantId'>;
export type IWarrantyInitData = Omit<IWarrantyBase, 'variantId'>;
export type IInstallmentPaymentInitData = Omit<
  IInstallmentPaymentBase,
  'variantId'
>;
