import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka.module';
import { ProductUpdatedConsumer } from '@infrastructure/transport/kafka/consumers/product-updated.consumer';
import { RedisCacheModule } from '@infrastructure/cache/redis.module';

@Module({
  imports: [KafkaModule.register(), RedisCacheModule],
  providers: [ProductUpdatedConsumer],
  exports: [],
})
export class ProductConsumersModule {}
