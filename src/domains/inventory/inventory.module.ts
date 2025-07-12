import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InventoryRepository } from './infrastructure/persistence/postgres/inventory.repository';
import { InventoryResolver } from './presentation/graphql/inventory.resolver';
import { CreateInventoryHandler } from './application/commands/create/create-inventory.handler';
import { PostgresModule } from 'src/infrastructure/database/postgres.module';
import { LoggerModule } from 'src/shared/winston/winston.module';

const CommandHandlers = [CreateInventoryHandler];

@Module({
  imports: [CqrsModule, PostgresModule, LoggerModule],
  providers: [
    { provide: 'IInventoryRepository', useClass: InventoryRepository },
    InventoryResolver,
    ...CommandHandlers,
  ],
})
export class InventoryModule {}
