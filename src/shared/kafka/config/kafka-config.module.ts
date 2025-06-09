import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaConfigService } from './kafka-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [KafkaConfigService],
  exports: [KafkaConfigService],
})
export class KafkaConfigModule {}
