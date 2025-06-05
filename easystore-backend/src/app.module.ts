import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphqlModule } from '@graphql/graphql.module';
import { PostgresModule } from '@database/postgres.module';
import { RedisConfigModule } from '@redis/redis.module';
import { MetricsController } from '@metrics/metrics.controller';
import { MetricsMiddleware } from '@metrics/metrics.middleware';
import { PrometheusModule } from '@metrics/prometheus.module';
import { KafkaConfigModule } from '@kafka/config/kafka-config.module';
import { AuthenticationDomain } from './domains/authentication/authentication.module';
import { TenantDomain } from './domains/tenant/tenant.module';
import { ProductDomain } from './domains/product/product.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
    }),
    GraphqlModule,
    PostgresModule,
    PrometheusModule,
    KafkaConfigModule,
    RedisConfigModule,
    AuthenticationDomain,
    TenantDomain,
    ProductDomain,
  ],
  providers: [],
  controllers: [MetricsController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MetricsMiddleware).exclude('metrics').forRoutes('*');
  }
}
