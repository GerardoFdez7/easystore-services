// Shared
export { Entity, EntityProps } from '@shared/entity.base';

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
} from './stock-per-warehouse/stock-per-warehouse.entity';
export {
  IStockPerWarehouseType,
  IStockPerWarehouseBase,
  IStockPerWarehouseSystem,
} from './stock-per-warehouse/stock-per-warehouse.attributes';
