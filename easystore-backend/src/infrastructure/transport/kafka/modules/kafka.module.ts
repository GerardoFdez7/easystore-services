import { Module, Global, DynamicModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { KafkaConfigModule } from '@transport/kafka/config/kafka-config.module';
import { KafkaConfigService } from '@transport/kafka/config/kafka-config.service';
import { KafkaHealthIndicator } from '@transport/kafka/health/kafka-health.indicator';
import { EventSerializer } from '@transport/kafka/serializers/event-serializer';
import { OrderCreatedProducer } from '@transport/kafka/producers/order-created.producer';
import { ProductUpdatedProducer } from '@transport/kafka/producers/product-updated.producer';

@Global()
@Module({})
export class KafkaModule {
  static register(): DynamicModule {
    return {
      module: KafkaModule,
      imports: [
        KafkaConfigModule,
        ClientsModule.registerAsync([
          {
            name: 'KAFKA_CLIENT',
            imports: [KafkaConfigModule],
            useFactory: (kafkaConfigService: KafkaConfigService) =>
              kafkaConfigService.createKafkaOptions(),
            inject: [KafkaConfigService],
          },
        ]),
      ],
      providers: [
        KafkaConfigService,
        KafkaHealthIndicator,
        EventSerializer,
        OrderCreatedProducer,
        ProductUpdatedProducer,
      ],
      exports: [
        ClientsModule,
        KafkaHealthIndicator,
        OrderCreatedProducer,
<<<<<<< HEAD
=======
        EventSerializer,
>>>>>>> 9a3bfa8 (feat(message-queue): event broker using kafka)
        ProductUpdatedProducer,
      ],
    };
  }
}
