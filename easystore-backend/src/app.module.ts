import {
  Module,
  Global,
  NestModule,
  MiddlewareConsumer,
  Type,
  DynamicModule,
  ForwardReference,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GraphqlModule } from '@infrastructure/graphql/graphql.module';
import { RedisCacheModule } from '@infrastructure/cache/redis.module';
import { PrometheusModule } from '@infrastructure/metrics/prometheus.module';
import { MetricsController } from '@infrastructure/metrics/metrics.controller';
import { MetricsMiddleware } from '@infrastructure/metrics/metrics.middleware';
import { KafkaModule } from '@infrastructure/transport/kafka/modules/kafka.module';
import { OrderConsumersModule } from '@infrastructure/transport/kafka/modules/order-consumers.module';

import { CartModule } from '@modules/cart/cart.module';
import { PrismaModule } from '@config/prisma/prisma.module';

import { ProductConsumersModule } from '@infrastructure/transport/kafka/modules/product-consumers.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
    }),
    KafkaModule.register(),
    OrderConsumersModule,
    GraphqlModule,
    RedisCacheModule,
    CartModule,
    PrometheusModule,
    PrismaModule,
    ProductConsumersModule,
  ] as (
    | Type<unknown>
    | DynamicModule
    | Promise<DynamicModule>
    | ForwardReference<unknown>
  )[],
  providers: [],
  controllers: [MetricsController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MetricsMiddleware).exclude('metrics').forRoutes('*');
  }
}
