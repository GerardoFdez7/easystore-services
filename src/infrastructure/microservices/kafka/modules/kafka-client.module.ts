import { Module, Global, DynamicModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { KafkaConfigModule } from '../config/kafka-config.module';
import { KafkaConfigService } from '../config/kafka-config.service';
import { KafkaHealthIndicator } from '../health/kafka-health.indicator';
import { EventSerializer } from '../serializers/event-serializer';

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
