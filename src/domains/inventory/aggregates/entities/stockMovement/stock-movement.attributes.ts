import {
  DeltaQty,
  Reason,
  CreatedById,
  WarehouseId,
  StockPerWarehouseId,
  OcurredAt,
} from '../../value-objects/stockMovement';
import { Id } from '@domains/value-objects';

// Complete stock movement type combining base properties and system properties
export interface IStockMovementType extends IStockMovementSystem {
  deltaQty: number;
  reason: string;
  createdById?: string;
  warehouseId: string;
  stockPerWarehouseId: string;
  ocurredAt: Date;
}

// Base stock movement properties shared across all movement-related types
export interface IStockMovementBase {
  deltaQty: number;
  reason: string;
  createdById?: string;
  warehouseId: string;
  stockPerWarehouseId: string;
  ocurredAt?: Date;
}

// System-generated properties for stock movement
export interface IStockMovementSystem {
  id: string;
}

// Props interface for the StockMovement entity
export interface IStockMovementProps {
  id: Id;
  deltaQty: DeltaQty;
  reason: Reason;
  createdById: CreatedById;
  warehouseId: WarehouseId;
  stockPerWarehouseId: StockPerWarehouseId;
  ocurredAt: OcurredAt;
} 