import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Commands Handlers
import {
  CreateWarehouseHandler,
  CreateStockPerWarehouseHandler,
  UpdateWarehouseHandler,
  UpdateStockPerWarehouseHandler,
  DeleteWarehouseHandler,
  DeleteStockPerWarehouseHandler,
} from './application/commands';
// Queries Handlers
import {
  GetWarehouseByIdHandler,
  GetAllWarehousesHandler,
  GetAllStockMovementsHandler,
} from './application/queries';
// Event Handlers
import {
  WarehouseCreatedHandler,
  WarehouseUpdatedHandler,
  WarehouseDeletedHandler,
  StockPerWarehouseAddedHandler,
  StockPerWarehouseUpdatedInWarehouseHandler,
  StockPerWarehouseRemovedFromWarehouseHandler,
} from './application/events';
import {
  WarehouseRepository,
  StockMovementRepository,
} from './infrastructure/postgres';
import InventoryResolver from './presentation/graphql/inventory.resolver';
import { ProductAdapter, AddressAdapter } from './infrastructure/adapters';

const CommandHandlers = [
  CreateWarehouseHandler,
  CreateStockPerWarehouseHandler,
  UpdateWarehouseHandler,
  UpdateStockPerWarehouseHandler,
  DeleteWarehouseHandler,
  DeleteStockPerWarehouseHandler,
];
const QueryHandlers = [
  GetWarehouseByIdHandler,
  GetAllWarehousesHandler,
  GetAllStockMovementsHandler,
];
const EventHandlers = [
  WarehouseCreatedHandler,
  WarehouseUpdatedHandler,
  WarehouseDeletedHandler,
  StockPerWarehouseAddedHandler,
  StockPerWarehouseUpdatedInWarehouseHandler,
  StockPerWarehouseRemovedFromWarehouseHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    { provide: 'IWarehouseRepository', useClass: WarehouseRepository },
    { provide: 'IStockMovementRepository', useClass: StockMovementRepository },
    { provide: 'IProductAdapter', useClass: ProductAdapter },
    { provide: 'IAddressAdapter', useClass: AddressAdapter },
    InventoryResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: ['IProductAdapter'],
})
export class InventoryDomain {}
