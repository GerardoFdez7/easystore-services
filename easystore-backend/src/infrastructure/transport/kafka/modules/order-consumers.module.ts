import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka.module';
import { OrderCreatedConsumer } from '../consumers/order-created.consumer';
import { OrderModule } from '@modules/orders/order.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { RedisCacheModule } from '@infrastructure/cache/redis.module';
import { LoggerModule } from '@infrastructure/logging/winston/winston.module';

@Module({
  imports: [
    KafkaModule.register(),
    OrderModule,
    InventoryModule,
    RedisCacheModule,
    LoggerModule,
  ],
  providers: [OrderCreatedConsumer],
  exports: [],
})
export class OrderConsumersModule {}
