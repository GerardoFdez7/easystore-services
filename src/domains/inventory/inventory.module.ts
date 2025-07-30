import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InventoryRepository } from './infrastructure/persistence/postgres/inventory.repository';
import { InventoryResolver } from './presentation/graphql/inventory.resolver';
import {
  CreateInventoryHandler,
  CreateStockPerWarehouseHandler,
  UpdateWarehouseHandler,
  UpdateStockPerWarehouseHandler,
  DeleteWarehouseHandler,
  DeleteStockPerWarehouseHandler,
} from './application/commands';
import {
  GetWarehouseByIdHandler,
  GetAllWarehousesHandler,
  GetStockPerWarehouseByIdHandler,
  GetAllStockPerWarehouseByWarehouseIdHandler,
} from './application/queries';
import {
  WarehouseCreatedHandler,
  WarehouseUpdatedHandler,
  WarehouseDeletedHandler,
} from './application/events';
import {
  StockPerWarehouseCreatedHandler,
  StockPerWarehouseDeletedHandler,
  StockPerWarehouseUpdatedHandler,
  StockPerWarehouseAddedHandler,
  StockPerWarehouseUpdatedInWarehouseHandler,
  StockPerWarehouseRemovedFromWarehouseHandler,
} from './application/events';
import { PostgresModule } from 'src/infrastructure/database/postgres.module';
import { LoggerModule } from 'src/shared/winston/winston.module';

const CommandHandlers = [
  CreateInventoryHandler,
  CreateStockPerWarehouseHandler,
  UpdateWarehouseHandler,
  UpdateStockPerWarehouseHandler,
  DeleteWarehouseHandler,
  DeleteStockPerWarehouseHandler,
];
const QueryHandlers = [
  GetWarehouseByIdHandler,
  GetAllWarehousesHandler,
  GetStockPerWarehouseByIdHandler,
  GetAllStockPerWarehouseByWarehouseIdHandler,
];
const EventHandlers = [
  WarehouseCreatedHandler,
  WarehouseUpdatedHandler,
  WarehouseDeletedHandler,
  StockPerWarehouseCreatedHandler,
  StockPerWarehouseDeletedHandler,
  StockPerWarehouseUpdatedHandler,
  StockPerWarehouseAddedHandler,
  StockPerWarehouseUpdatedInWarehouseHandler,
  StockPerWarehouseRemovedFromWarehouseHandler,
];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    { provide: 'IInventoryRepository', useClass: InventoryRepository },
    InventoryResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class InventoryDomain {}
