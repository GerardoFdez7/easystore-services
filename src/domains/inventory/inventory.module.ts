import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductDomain } from '@product/product.module';

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
import ProductAdapter from './infrastructure/adapters/product.adapter';

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
  imports: [CqrsModule, ProductDomain],
  providers: [
    { provide: 'IWarehouseRepository', useClass: WarehouseRepository },
    { provide: 'IStockMovementRepository', useClass: StockMovementRepository },
    { provide: 'IProductAdapter', useClass: ProductAdapter },
    InventoryResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class InventoryDomain {}
