import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka.module';
import { ProductUpdatedConsumer } from '@infrastructure/transport/kafka/consumers/product-updated.consumer';
import { RedisCacheModule } from '@infrastructure/cache/redis.module';
import { LoggerModule } from '@infrastructure/logging/winston/winston.module';

@Module({
  imports: [KafkaModule.register(), RedisCacheModule, LoggerModule],
  providers: [ProductUpdatedConsumer],
  exports: [],
})
export class ProductConsumersModule {}
