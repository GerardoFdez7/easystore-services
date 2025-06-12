import { TypeEnum } from '../../value-objects';
import {
  IVariantBase,
  IVariantType,
  IMediaBase,
  IMediaType,
  IProductCategoriesBase,
  IProductCategoriesType,
  ISustainabilityBase,
  ISustainabilityType,
} from '../';

// Complete product type combining base properties, and system properties
export interface IProductType extends IProductSystem {
  name: string;
  shortDescription: string;
  longDescription?: string;
  productType: TypeEnum;
  cover?: string;
  brand?: string;
  manufacturer?: string;
  tags: string[];
  tenantId: number;
  variants: IVariantType[];
  media: IMediaType[];
  categories: IProductCategoriesType[];
  sustainabilities: ISustainabilityType[];
}

// Base product properties shared across all product-related types
export interface IProductBase {
  name: string;
  shortDescription: string;
  longDescription?: string;
  productType: TypeEnum;
  cover?: string;
  brand?: string;
  manufacturer?: string;
  tags?: string[];
  tenantId: number;
  variants?: IVariantInitData[];
  media?: IMediaInitData[];
  categories?: IProductCategoryInitData[];
  sustainabilities?: ISustainabilityInitData[];
}

// System-generated properties for a product
export interface IProductSystem {
  id: number;
  isArchived: boolean;
  updatedAt: Date;
  createdAt: Date;
}

// Define InitData types for sub-entities (excluding parent IDs)
export type IVariantInitData = Omit<IVariantBase, 'productId' | 'tenantId'>;
export type IMediaInitData = Omit<IMediaBase, 'productId' | 'variantId'>;
export type IProductCategoryInitData = Omit<
  IProductCategoriesBase,
  'productId'
>;
export type ISustainabilityInitData = Omit<ISustainabilityBase, 'productId'>;
