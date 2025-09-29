// Complete Category type comining base properties, and system properties
export interface ICategoryType extends ICategorySystem, ICategoryBase {}

// Base properties for a Category
export interface ICategoryBase {
  id?: string;
  name: string;
  cover: string;
  description?: string;
  subCategories?: ICategoryType[];
  parentId?: string;
  tenantId: string;
}

// System-generated properties for a Category
export interface ICategorySystem {
  updatedAt: Date;
  createdAt: Date;
}
