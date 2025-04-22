import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphqlModule } from '@graphql/graphql.module';
import { RedisCacheModule } from '@cache/redis.module';
import { PrometheusModule } from '@metrics/prometheus.module';
import { MetricsController } from '@metrics/metrics.controller';
import { MetricsMiddleware } from '@metrics/metrics.middleware';
import { KafkaModule } from '@transport/kafka/modules/kafka.module';
import { OrderConsumersModule } from '@transport/kafka/modules/order-consumers.module';
import { CartModule } from '@/modules/cart/cart.module';
import { PrismaModule } from '@prisma/prisma.module';
import { ProductConsumersModule } from '@transport/kafka/modules/product-consumers.module';

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
  ],
  providers: [],
  controllers: [MetricsController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MetricsMiddleware).exclude('metrics').forRoutes('*');
  }
}
