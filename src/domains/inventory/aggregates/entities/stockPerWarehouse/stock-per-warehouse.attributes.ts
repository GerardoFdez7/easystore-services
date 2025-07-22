import {
  QtyAvailable,
  QtyReserved,
  ProductLocation,
  EstimatedReplenishmentDate,
  LotNumber,
  SerialNumbers,
} from '../../value-objects';
import { Id } from '@domains/value-objects';

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

// Props interface for the StockPerWarehouse entity
export interface IStockPerWarehouseProps {
  id: Id;
  qtyAvailable: QtyAvailable;
  qtyReserved: QtyReserved;
  productLocation: ProductLocation;
  estimatedReplenishmentDate: EstimatedReplenishmentDate;
  lotNumber: LotNumber;
  serialNumbers: SerialNumbers;
  variantId: Id;
  warehouseId: Id;
}
