import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisConfigModule } from '@/config/redis-config.module';
import { RedisConfigService } from '@/config/redis-config.service';
import { RedisCacheAdapter } from '@/infrastructure/cache/adapters/redis-cache.adapter';
import { RedisHealthIndicator } from '@infrastructure/cache/health/redis-health.indicator';

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
