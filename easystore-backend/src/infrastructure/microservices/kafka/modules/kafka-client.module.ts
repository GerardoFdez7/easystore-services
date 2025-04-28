import { Module, Global, DynamicModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { KafkaConfigModule } from '@shared/kafka/config/kafka-config.module';
import { KafkaConfigService } from '@shared/kafka/config/kafka-config.service';
import { KafkaHealthIndicator } from '@shared/kafka/health/kafka-health.indicator';
import { EventSerializer } from '@shared/kafka/serializers/event-serializer';

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
      providers: [KafkaConfigService, KafkaHealthIndicator, EventSerializer],
      exports: [ClientsModule, KafkaHealthIndicator],
    };
  }
}
