import { MetadataProps } from '../../value-objects';

// Complete product type combining base properties, system properties, and variants
export interface IProductType extends IProductBase, IProductSystem {}

// Base product properties shared across all product-related types
export interface IProductBase {
  name: string;
  shortDescription: string;
  longDescription?: string | null;
  type: 'PHYSICAL' | 'DIGITAL';
  cover?: string | null;
  brand?: string | null;
  manufacturer?: string | null;
  tags: string[];
  tenantId: number;
}

// System-generated properties for a product
export interface IProductSystem {
  id: number;
  metadata: MetadataProps;
  createdAt: Date;
  updatedAt: Date;
}
