import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InventoryRepository } from './infrastructure/persistence/postgres/inventory.repository';
import { InventoryResolver } from './presentation/graphql/inventory.resolver';
import { CreateInventoryHandler } from './application/commands/create/create-inventory.handler';
import { CreateStockPerWarehouseHandler } from './application/commands/create/create-stock-per-warehouse.handler';
import { UpdateWarehouseHandler } from './application/commands/update/update-warehouse.handler';
import { DeleteWarehouseHandler } from './application/commands/delete/delete-warehouse.handler';
import { DeleteStockPerWarehouseHandler } from './application/commands/delete/delete-stock-per-warehouse.handler';
import { GetWarehouseByIdHandler } from './application/queries/get-warehouse-by-id/get-warehouse-by-id.handler';
import { GetAllWarehousesHandler } from './application/queries/get-all-warehouses/get-all-warehouses.handler';
import { GetStockPerWarehouseByIdHandler } from './application/queries/get-stock-per-warehouse-by-id/get-stock-per-warehouse-by-id.handler';
import { GetAllStockPerWarehouseByWarehouseIdHandler } from './application/queries/get-all-stock-per-warehouse-by-warehouse-id/get-all-stock-per-warehouse-by-warehouse-id.handler';
import { WarehouseCreatedHandler, WarehouseUpdatedHandler, WarehouseDeletedHandler } from './application/events';
import { StockPerWarehouseCreatedHandler, StockPerWarehouseDeletedHandler } from './application/events';
import { PostgresModule } from 'src/infrastructure/database/postgres.module';
import { LoggerModule } from 'src/shared/winston/winston.module';

const CommandHandlers = [CreateInventoryHandler, CreateStockPerWarehouseHandler, UpdateWarehouseHandler, DeleteWarehouseHandler, DeleteStockPerWarehouseHandler];
const QueryHandlers = [GetWarehouseByIdHandler, GetAllWarehousesHandler, GetStockPerWarehouseByIdHandler, GetAllStockPerWarehouseByWarehouseIdHandler];
const EventHandlers = [WarehouseCreatedHandler, WarehouseUpdatedHandler, WarehouseDeletedHandler, StockPerWarehouseCreatedHandler, StockPerWarehouseDeletedHandler];

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
export class InventoryModule {}
