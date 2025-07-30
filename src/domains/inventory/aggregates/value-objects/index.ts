// Import shared value objects
export {
  Name,
  ShortDescription,
  LongDescription,
} from '@domains/value-objects';

// StockPerWarehouse value objects
export { QtyAvailable } from './stockPerWarehouse/qty-available.vo';
export { QtyReserved } from './stockPerWarehouse/qty-reserved.vo';
export { EstimatedReplenishmentDate } from './stockPerWarehouse/estimated-replenishment-date.vo';
export { LotNumber } from './stockPerWarehouse/lot-number.vo';
export { SerialNumbers } from './stockPerWarehouse/serial-numbers.vo';

// StockMovement value objects
export { DeltaQty } from './stockMovement/delta-qty.vo';
