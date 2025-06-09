import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, {
  RedisOptions,
  ClusterOptions,
  Cluster as RedisClusterInstance,
} from 'ioredis';

@Injectable()
export class RedisConfigService {
  constructor(private config: ConfigService) {}

  createRedisOptions(): RedisOptions {
    return {
      name: 'default',
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD', ''),
      db: this.config.get<number>('REDIS_DB', 0),
      keyPrefix: this.config.get<string>('REDIS_KEY_PREFIX', 'ecommerce:'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      commandTimeout: 5000,
    };
  }

  createStandaloneOptions(): RedisOptions {
    return {
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: +this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD'),
      db: +this.config.get<number>('REDIS_DB', 0),
      keyPrefix: this.config.get<string>('REDIS_KEY_PREFIX', 'ecommerce:'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      enableReadyCheck: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 3,
      commandTimeout: 5000,
    };
  }

  createSentinelOptions(): RedisOptions {
    const sentinels = this.getSentinels();
    return {
      sentinels,
      name: 'master',
      password: this.config.get<string>('REDIS_PASSWORD'),
      sentinelPassword: this.config.get<string>('REDIS_SENTINEL_PASSWORD'),
      db: +this.config.get<number>('REDIS_DB', 0),
      keyPrefix: this.config.get<string>('REDIS_KEY_PREFIX', 'ecommerce:'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      enableReadyCheck: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 3,
      commandTimeout: 5000,
    };
  }

  createClusterOptions(): ClusterOptions {
    return {
      redisOptions: {
        password: this.config.get<string>('REDIS_PASSWORD'),
        keyPrefix: this.config.get<string>('REDIS_KEY_PREFIX', 'ecommerce:'),
        sentinelRetryStrategy: (times) => Math.min(times * 50, 2000),
        enableAutoPipelining: true,
        maxRetriesPerRequest: 3,
        commandTimeout: 5000,
      },
      slotsRefreshTimeout: 2000,
      slotsRefreshInterval: 10000,
    };
  }

  getSentinels(): { host: string; port: number }[] {
    const hosts = this.config
      .get<string>('REDIS_SENTINEL_HOSTS', 'localhost:26379')
      .split(',');
    return hosts.map((hp) => {
      const [host, port] = hp.trim().split(':');
      return { host, port: +port };
    });
  }

  getClusterNodes(): { host: string; port: number }[] {
    const hosts = this.config
      .get<string>('REDIS_CLUSTER_HOSTS', 'localhost')
      .split(',');
    const ports = this.config
      .get<string>('REDIS_CLUSTER_PORTS', '6379,6380,6381')
      .split(',')
      .map((p) => +p.trim());
    return hosts.flatMap((host) =>
      ports.map((port) => ({ host: host.trim(), port })),
    );
  }

  createClient(): Redis | RedisClusterInstance {
    if (this.config.get<boolean>('REDIS_SENTINEL_ENABLED')) {
      return new Redis(this.createSentinelOptions());
    }
    if (this.config.get<boolean>('REDIS_CLUSTER_ENABLED')) {
      return new Redis.Cluster(
        this.getClusterNodes(),
        this.createClusterOptions(),
      );
    }
    return new Redis(this.createStandaloneOptions());
  }
}
