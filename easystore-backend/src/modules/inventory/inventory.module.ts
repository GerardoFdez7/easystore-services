import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@prisma/prisma.module';
import { RedisCacheModule } from '@cache/redis.module';
import { KafkaModule } from '@transport/kafka/modules/kafka.module';
import { InventoryService } from '@application/services/inventory.service';
import { InventoryResolver } from './interfaces/graphql/inventory.resolver';
import { InventoryRepository } from '@repositories/inventory.repository';
import { UpdateInventoryHandler } from './application/commands/handlers/update-inventory.handler';
import { GetInventoryHandler } from './application/queries/handlers/get-inventory.handler';

const CommandHandlers = [UpdateInventoryHandler];
const QueryHandlers = [GetInventoryHandler];

@Module({
  imports: [CqrsModule, PrismaModule, RedisCacheModule, KafkaModule.register()],
  providers: [
    InventoryService,
    InventoryResolver,
    InventoryRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
