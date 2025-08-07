// Complete stock per warehouse type combining base properties and system properties
export interface IStockPerWarehouseType extends IStockPerWarehouseSystem {
  qtyAvailable: number;
  qtyReserved: number;
  productLocation?: string;
  estimatedReplenishmentDate?: Date;
  lotNumber?: string;
  serialNumbers: string[];
  variantId: string;
  warehouseId: string;
}

// Base stock per warehouse properties shared across all stock-related types
export interface IStockPerWarehouseBase {
  qtyAvailable: number;
  qtyReserved?: number;
  productLocation?: string;
  estimatedReplenishmentDate?: Date;
  lotNumber?: string;
  serialNumbers?: string[];
  variantId: string;
  warehouseId: string;
}

// System-generated properties for stock per warehouse
export interface IStockPerWarehouseSystem {
  id: string;
}
