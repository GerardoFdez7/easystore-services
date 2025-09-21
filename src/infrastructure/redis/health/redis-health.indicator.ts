import { Injectable, Inject } from '@nestjs/common';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { LoggerService } from '@logger/winston.service';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicatorService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redis.ping();
      const isHealthy = pong === 'PONG';
      return this.getStatus(key, isHealthy, {
        responseTime: await this.measureResponseTime(),
      });
    } catch (err: unknown) {
      this.logger.error('HealthCheck Redis falló', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        [key]: { status: 'down', error: errorMessage },
      };
    }
  }

  private async measureResponseTime(): Promise<number> {
    const start = Date.now();
    await this.redis.ping();
    return Date.now() - start;
  }

  private getStatus(
    key: string,
    isHealthy: boolean,
    data: Record<string, unknown>,
  ): HealthIndicatorResult {
    const status = isHealthy ? 'up' : 'down';
    return {
      [key]: {
        status,
        ...data,
      },
    };
  }
}
