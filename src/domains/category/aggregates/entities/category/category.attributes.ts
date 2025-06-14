// Complete Category type comining base properties, and system properties
export interface ICategoryType extends ICategorySystem, ICategoryBase {}

// Base properties for a Category
export interface ICategoryBase {
  name: string;
  description?: string;
  subCategories?: ICategoryType[];
  parentId?: string;
  tenantId: string;
}

// System-generated properties for a Category
export interface ICategorySystem {
  id: string;
  updatedAt: Date;
  createdAt: Date;
}
