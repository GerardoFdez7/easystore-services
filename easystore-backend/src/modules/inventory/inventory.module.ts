import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@prisma/prisma.module';
import { RedisCacheModule } from '@infrastructure/cache/redis.module';
import { KafkaModule } from '@infrastructure/transport/kafka/modules/kafka.module';
import { InventoryService } from '@application/services/inventory.service';
import { InventoryResolver } from '@modules/inventory/interfaces/graphql/inventory.resolver';
import { InventoryRepository } from '@infrastructure/repositories/inventory.repository';
import { UpdateInventoryHandler } from '@modules/inventory/application/commands/handlers/update-inventory.handler';
import { GetInventoryHandler } from '@modules/inventory/application/queries/handlers/get-inventory.handler';
import { AuthModule } from '@/infrastructure/auth/auth.module';

const CommandHandlers = [UpdateInventoryHandler];
const QueryHandlers = [GetInventoryHandler];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    PrismaModule,
    RedisCacheModule,
    KafkaModule.register(),
  ],
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
