import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisConfigModule } from '@config/redis/redis.module';
import { RedisCacheAdapter } from '@infrastructure/cache/adapters/redis-cache.adapter';
import { RedisHealthIndicator } from '@infrastructure/cache/health/redis-health.indicator';
import { LoggerModule } from '@infrastructure/logging/winston/winston.module';
import { CacheInvalidationService } from '@infrastructure/cache/pubsub/cache-invalidation.service';
import { LoggerService } from '@logging/winston/winston.service';
import Redis, { RedisOptions } from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule, RedisConfigModule, LoggerModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService, logger: LoggerService) => {
        let opts: RedisOptions;
        const sentinelString = config.get<string>('REDIS_SENTINELS');
        if (sentinelString) {
          opts = {
            sentinels: sentinelString.split(',').map((s) => {
              const [host, port] = s.split(':');
              return { host, port: parseInt(port, 10) };
            }),
            name: config.get<string>('REDIS_MASTER_NAME', 'mymaster'),
          };
        } else {
          opts = {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
            lazyConnect: true,
            password: config.get<string>('REDIS_PASSWORD', undefined),
            db: config.get<number>('REDIS_DB', 0),
            maxRetriesPerRequest: config.get<number>(
              'REDIS_MAX_RETRIES_PER_REQUEST',
              0,
            ),
          };
        }
        const client = new Redis(opts);
        client.on('error', (err) => {
          logger.error('[ioredis] error:', err);
        });

        client.connect().catch((err: Error) => {
          logger.warn(
            'Cannot connect to Redis, NestJS app continues without caching:',
            err.message,
          );
        });

        return client;
      },
      inject: [ConfigService, LoggerService],
    },
    CacheInvalidationService,
    RedisHealthIndicator,
    RedisCacheAdapter,
  ],
  exports: ['REDIS_CLIENT', RedisCacheAdapter, CacheInvalidationService],
})
export class RedisCacheModule {}
