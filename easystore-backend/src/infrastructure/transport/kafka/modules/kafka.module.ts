import { Module, Global, DynamicModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { KafkaConfigModule } from '@infrastructure/transport/kafka/config/kafka-config.module';
import { KafkaConfigService } from '@infrastructure/transport/kafka/config/kafka-config.service';
import { KafkaHealthIndicator } from '@infrastructure/transport/kafka/health/kafka-health.indicator';
import { EventSerializer } from '@infrastructure/transport/kafka/serializers/event-serializer';
import { OrderCreatedProducer } from '@infrastructure/transport/kafka/producers/order-created.producer';
import { ProductUpdatedProducer } from '@infrastructure/transport/kafka/producers/product-updated.producer';

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
        ProductUpdatedProducer,
      ],
    };
  }
}
