// Shared
export { Entity, EntityProps } from '@domains/entity.base';

// Warehouse entity
export { Warehouse, IWarehouseProps } from './warehouse/warehouse.entity';
export {
  IWarehouseType,
  IWarehouseBase,
  IWarehouseSystem,
} from './warehouse/warehouse.attributes';

// StockPerWarehouse entity
export {
  StockPerWarehouse,
  IStockPerWarehouseProps,
} from './stockPerWarehouse/stock-per-warehouse.entity';
export {
  IStockPerWarehouseType,
  IStockPerWarehouseBase,
  IStockPerWarehouseSystem,
} from './stockPerWarehouse/stock-per-warehouse.attributes';

// StockMovement entity
export {
  StockMovement,
  IStockMovementProps,
} from './stockMovement/stock-movement.entity';
export {
  IStockMovementType,
  IStockMovementBase,
  IStockMovementSystem,
} from './stockMovement/stock-movement.attributes';
