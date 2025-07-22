import { DeltaQty, Reason } from '../../value-objects';
import { Id } from '@domains/value-objects';
import { EntityProps } from '@domains/entity.base';

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
export interface IStockMovementProps extends EntityProps {
  id: Id;
  deltaQty: DeltaQty;
  reason: Reason;
  createdById: string | null;
  warehouseId: Id;
  stockPerWarehouseId: Id;
  ocurredAt: Date;
}
