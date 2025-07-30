// Complete warehouse type combining base properties and system properties
export interface IWarehouseType extends IWarehouseSystem {
  name: string;
  addressId: string;
  tenantId: string;
}

// Base warehouse properties shared across all warehouse-related types
export interface IWarehouseBase {
  name: string;
  addressId: string;
  tenantId: string;
}

// System-generated properties for a warehouse
export interface IWarehouseSystem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
