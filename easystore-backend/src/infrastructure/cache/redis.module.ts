import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisConfigModule } from '@config/redis/redis.module';
import { RedisConfigService } from '@/config/redis/redis.service';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import { RedisHealthIndicator } from '@cache/health/redis-health.indicator';

@Global()
@Module({
  imports: [ConfigModule, RedisConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (cfg: RedisConfigService) => cfg.createClient(),
      inject: [RedisConfigService],
    },
    RedisHealthIndicator,
    RedisCacheAdapter,
  ],
  exports: ['REDIS_CLIENT', RedisCacheAdapter],
})
export class RedisCacheModule {}
