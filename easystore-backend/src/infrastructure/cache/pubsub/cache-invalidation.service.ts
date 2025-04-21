import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from '@nestjs/common';
import Redis from 'ioredis';

interface InvalidationMessage {
  type: 'key' | 'pattern';
  value: string;
  source: string;
}

@Injectable()
export class CacheInvalidationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheInvalidationService.name);
  private readonly instanceId =
    Date.now().toString(36) + Math.random().toString(36).substring(2);
  private subscriber: Redis;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    this.subscriber = this.redis.duplicate();
  }

  async onModuleInit(): Promise<void> {
    await this.subscriber.connect();
    await this.subscriber.subscribe('cache:invalidation');

    this.subscriber.on('message', (channel: string, message: string) => {
      if (channel !== 'cache:invalidation') return;

      void (async () => {
        try {
          const parsedMessage = JSON.parse(message) as InvalidationMessage;
          const invalidation: InvalidationMessage = {
            type: parsedMessage.type,
            value: parsedMessage.value,
            source: parsedMessage.source,
          };
          if (invalidation.source === this.instanceId) return;

          this.logger.debug(
            `Recibida invalidación: ${invalidation.type} → ${invalidation.value}`,
          );

          if (invalidation.type === 'key') {
            await this.redis.del(invalidation.value);
          } else {
            await this.invalidateByPattern(invalidation.value);
          }
        } catch (err: unknown) {
          const error = err as Error;
          this.logger.error(
            `Error procesando mensaje: ${error.message}`,
            error.stack,
          );
        }
      })();
    });

    this.logger.log(
      `CacheInvalidation inicializado (instanceId=${this.instanceId})`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber.unsubscribe('cache:invalidation');
    await this.subscriber.quit();
  }

  async invalidateKey(key: string): Promise<void> {
    await this.redis.del(key);

    const msg: InvalidationMessage = {
      type: 'key',
      value: key,
      source: this.instanceId,
    };
    await this.redis.publish('cache:invalidation', JSON.stringify(msg));
  }

  async invalidatePattern(pattern: string): Promise<void> {
    await this.invalidateByPattern(pattern);

    const msg: InvalidationMessage = {
      type: 'pattern',
      value: pattern,
      source: this.instanceId,
    };
    await this.redis.publish('cache:invalidation', JSON.stringify(msg));
  }

  private async invalidateByPattern(pattern: string): Promise<void> {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      if (keys.length) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0');
  }
}
