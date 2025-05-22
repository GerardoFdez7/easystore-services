import {
  AttributeProps,
  DimensionProps,
  ConditionEnum,
} from '../../value-objects';
import { IMediaBase, IWarrantyBase, IInstallmentPaymentBase } from '../';

export interface IVariantType extends IVariantBase, IVariantSystem {}

export interface IVariantBase {
  name: string;
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

export type IMediaInitData = Omit<IMediaBase, 'productId' | 'variantId'>;
export type IWarrantyInitData = Omit<IWarrantyBase, 'variantId'>;
export type IInstallmentPaymentInitData = Omit<
  IInstallmentPaymentBase,
  'variantId'
>;
