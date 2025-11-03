import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { CircuitBreaker } from '@redis/circuit-breaker';
import { CacheInvalidationService } from '../pubsub/cache-invalidation.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisCacheAdapter
  implements CachePort, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisCacheAdapter.name);
  private readonly breaker = new CircuitBreaker({
    name: 'redis-cache',
    failureThreshold: 5,
    resetTimeout: 10000,
    onOpen: () => this.logger.warn('Redis circuit breaker opened'),
    onClose: () => this.logger.log('Redis circuit breaker closed'),
    onHalfOpen: () => this.logger.log('Redis circuit breaker half-open'),
  });
  private readonly defaultTtl = +this.config.get<number>(
    'REDIS_DEFAULT_TTL',
    3600,
  );

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly invalidationService: CacheInvalidationService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    this.redis.on('connect', () => this.logger.log('Redis conectado'));
    this.redis.on('error', (err) => this.logger.error('Redis error', err));
    this.redis.on('reconnecting', () => this.logger.warn('Redis reconectando'));
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Cerrando conexión Redis...');
    await this.redis.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.breaker.execute(async () => {
        const data = await this.redis.get(key);
        return data ? (JSON.parse(data) as T) : null;
      });
    } catch (err) {
      this.logger.error(`Error GET ${key}`, err);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.breaker.execute(async () => {
        await this.redis.set(
          key,
          JSON.stringify(value),
          'EX',
          ttl ?? this.defaultTtl,
        );
      });
    } catch (err) {
      this.logger.error(`Error SET ${key}`, err);
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await this.breaker.execute(
        async () => await this.invalidationService.invalidateKey(key),
      );
    } catch (err) {
      this.logger.error(`Error invalidating cache key ${key}:`, err);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      await this.breaker.execute(async () => {
        await this.invalidationService.invalidatePattern(pattern);
      });
    } catch (err) {
      this.logger.error(`Error DELPATTERN ${pattern}`, err);
    }
  }

  async addToCart(
    userId: string,
    productId: string,
    qty: number,
  ): Promise<void> {
    const key = `cart:${userId}`;
    try {
      await this.breaker.execute(async () => {
        const pipe = this.redis.pipeline();
        pipe.hincrby(key, productId, qty);
        pipe.expire(key, 86400);
        await pipe.exec();
      });
    } catch (err) {
      this.logger.error(`Error addToCart ${userId}`, err);
    }
  }

  async getCart(userId: string): Promise<Record<string, number>> {
    try {
      return await this.breaker.execute(async () => {
        const data = await this.redis.hgetall(`cart:${userId}`);
        return Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, parseInt(v, 10)]),
        );
      });
    } catch (err) {
      this.logger.error(`Error getCart ${userId}`, err);
      return {};
    }
  }

  async removeFromCart(userId: number, productId: string): Promise<void> {
    const cartKey = `cart:${userId}`;

    try {
      await this.breaker.execute(async () => {
        await this.redis.hdel(cartKey, productId);
      });
    } catch (err) {
      this.logger.error(`Error removing from cart for user ${userId}`, err);
    }
  }

  async clearCart(userId: number): Promise<void> {
    const cartKey = `cart:${userId}`;
    try {
      await this.breaker.execute(async () => {
        await this.redis.del(cartKey);
      });
      this.logger.log(`Cart cleared from cache for user ${userId}`);
    } catch (err) {
      this.logger.error(`Error clearing cart for user ${userId}`, err);
    }
  }
}

export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
  addToCart(userId: string, productId: string, qty: number): Promise<void>;
  getCart(userId: string): Promise<Record<string, number>>;
  removeFromCart(userId: number, productId: string): Promise<void>;
  clearCart(userId: number): Promise<void>;
}
