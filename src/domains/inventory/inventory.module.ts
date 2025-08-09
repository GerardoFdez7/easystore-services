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
} from './infrastructure/persistence/postgres';
import InventoryResolver from './presentation/graphql/inventory.resolver';

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
    InventoryResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class InventoryDomain {}
