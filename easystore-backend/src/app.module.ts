import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphqlModule } from '@/infrastructure/graphql/graphql.module';
import { RedisCacheModule } from '@/infrastructure/cache/redis.module';
import { PrometheusModule } from '@/infrastructure/metrics/prometheus.module';
import { MetricsController } from '@/infrastructure/metrics/metrics.controller';
import { MetricsMiddleware } from '@/infrastructure/metrics/metrics.middleware';
import { CartModule } from '@modules/cart/cart.module';
import { PrismaModule } from '@prisma/prisma.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
    }),
    GraphqlModule,
    RedisCacheModule,
    CartModule,
    PrometheusModule,
    PrismaModule,
  ],
  providers: [],
  controllers: [MetricsController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MetricsMiddleware).exclude('metrics').forRoutes('*');
  }
}
