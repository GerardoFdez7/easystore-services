import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphqlModule } from '@graphql/graphql.module';
import { PostgreModule } from '@database/postgre/postgre.module';
import { MongoModule } from '@infrastructure/database/mongo/mongo.module';
import { RedisConfigModule } from '@shared/redis/redis.module';
import { MetricsController } from '@metrics/metrics.controller';
import { MetricsMiddleware } from '@metrics/metrics.middleware';
import { PrometheusModule } from '@metrics/prometheus.module';
import { KafkaConfigModule } from '@shared/kafka/config/kafka-config.module';
import { TenantModule } from '@domains/tenant/tenant.module';
import { ProductModule } from '@domains/product/product.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
    }),
    GraphqlModule,
    PostgreModule,
    MongoModule,
    PrometheusModule,
    KafkaConfigModule,
    RedisConfigModule,
    TenantModule,
    ProductModule,
  ],
  providers: [],
  controllers: [MetricsController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MetricsMiddleware).exclude('metrics').forRoutes('*');
  }
}
