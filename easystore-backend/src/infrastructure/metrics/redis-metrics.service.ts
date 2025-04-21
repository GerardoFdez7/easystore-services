import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Gauge } from 'prom-client';
import Redis from 'ioredis';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrometheusService } from '@/infrastructure/metrics/prometheus.service';

@Injectable()
export class RedisMetricsService implements OnModuleInit {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly prometheusService: PrometheusService,
  ) {}

  onModuleInit(): void {
    const hitRateGauge: Gauge = this.prometheusService.registerGauge(
      'redis_cache_hit_rate',
      'Redis cache hit rate',
    );

    const memoryUsageGauge: Gauge = this.prometheusService.registerGauge(
      'redis_memory_usage_bytes',
      'Redis memory usage in bytes',
    );

    const connectedClientsGauge: Gauge = this.prometheusService.registerGauge(
      'redis_connected_clients',
      'Number of connected Redis clients',
    );

    const opsPerSecondGauge: Gauge = this.prometheusService.registerGauge(
      'redis_ops_per_second',
      'Redis operations per second',
    );

    const interval = setInterval(() => {
      void (async () => {
        try {
          const info = await this.redis.info();

          const infoSections = this.parseRedisInfo(info);

          if (infoSections.stats) {
            const hits = parseInt(infoSections.stats.keyspace_hits || '0', 10);
            const misses = parseInt(
              infoSections.stats.keyspace_misses || '0',
              10,
            );
            const hitRate = hits / (hits + misses || 1);
            hitRateGauge.set(hitRate);
          }

          if (infoSections.memory) {
            const used = parseInt(infoSections.memory.used_memory || '0', 10);
            memoryUsageGauge.set(used);
          }

          if (infoSections.clients) {
            const clients = parseInt(
              infoSections.clients.connected_clients || '0',
              10,
            );
            connectedClientsGauge.set(clients);
          }

          if (infoSections.stats) {
            const ops = parseInt(
              infoSections.stats.instantaneous_ops_per_sec || '0',
              10,
            );
            opsPerSecondGauge.set(ops);
          }
        } catch {
          // TODO: Add error handling if needed
        }
      })();
    }, 15_000);

    this.schedulerRegistry.addInterval('redis-metrics', interval);
  }

  private parseRedisInfo(info: string): Record<string, Record<string, string>> {
    const sections: Record<string, Record<string, string>> = {};
    let current: string;

    for (const line of info.split('\n')) {
      if (line.startsWith('#')) {
        current = line.substring(2).trim().toLowerCase();
        sections[current] = {};
      } else if (line.includes(':') && current) {
        const [key, val] = line.split(':');
        sections[current][key.trim()] = val.trim();
      }
    }

    return sections;
  }
}
