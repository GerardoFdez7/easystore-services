import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InventoryRepository } from './infrastructure/persistence/postgres/inventory.repository';
import { InventoryResolver } from './presentation/graphql/inventory.resolver';
import { CreateInventoryHandler } from './application/commands/create/create-inventory.handler';
import { UpdateWarehouseHandler } from './application/commands/update/update-warehouse.handler';
import { DeleteWarehouseHandler } from './application/commands/delete/delete-warehouse.handler';
import { GetWarehouseByIdHandler } from './application/queries/get-warehouse-by-id/get-warehouse-by-id.handler';
import { GetAllWarehousesHandler } from './application/queries/get-all-warehouses/get-all-warehouses.handler';
import { WarehouseCreatedHandler, WarehouseUpdatedHandler, WarehouseDeletedHandler } from './application/events';
import { PostgresModule } from 'src/infrastructure/database/postgres.module';
import { LoggerModule } from 'src/shared/winston/winston.module';

const CommandHandlers = [CreateInventoryHandler, UpdateWarehouseHandler, DeleteWarehouseHandler];
const QueryHandlers = [GetWarehouseByIdHandler, GetAllWarehousesHandler];
const EventHandlers = [WarehouseCreatedHandler, WarehouseUpdatedHandler, WarehouseDeletedHandler];

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
