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

interface VariantCoreAttributes {
  attributes: AttributeProps[];
  price: number;
  variantCover?: string;
  weight?: number;
  dimension?: DimensionProps;
  condition: ConditionEnum;
  upc?: string;
  ean?: string;
  sku: string;
  barcode?: string;
  isbn?: string;
  productId: string;
  tenantId: string;
}

export interface IVariantBase extends VariantCoreAttributes {
  personalizationOptions?: string[];
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

export interface IVariantType extends IVariantSystem, VariantCoreAttributes {
  personalizationOptions: string[];
  variantMedia: IMediaType[];
  warranties: IWarrantyType[];
  installmentPayments: IInstallmentPaymentType[];
}

export type IMediaInitData = Omit<
  IMediaBase,
  'productId' | 'variantId' | 'tenantId'
>;
export type IWarrantyInitData = Omit<IWarrantyBase, 'variantId'>;
export type IInstallmentPaymentInitData = Omit<
  IInstallmentPaymentBase,
  'variantId'
>;
