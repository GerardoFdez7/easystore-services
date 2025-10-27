import { Injectable, OnModuleInit } from '@nestjs/common';
import prom from 'prom-client';
import { INestApplication } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class PrometheusService implements OnModuleInit {
  private readonly registry: prom.Registry;
  private readonly prefix: string = 'ecommerce_';

  private counters: Map<string, prom.Counter<string>> = new Map();
  private gauges: Map<string, prom.Gauge<string>> = new Map();
  private histograms: Map<string, prom.Histogram<string>> = new Map();
  private summaries: Map<string, prom.Summary<string>> = new Map();

  constructor() {
    this.registry = new prom.Registry();

    prom.collectDefaultMetrics({
      register: this.registry,
      prefix: this.prefix,
    });
  }

  onModuleInit(): void {
    this.registerCounter(
      'http_requests_total',
      'Total number of HTTP requests',
      ['method', 'path', 'status'],
    );
    this.registerHistogram(
      'http_request_duration_seconds',
      'HTTP request duration in seconds',
      ['method', 'path'],
      {
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      },
    );

    this.registerCounter(
      'redis_requests_total',
      'Total number of Redis operations',
      ['operation', 'status'],
    );
    this.registerHistogram(
      'redis_operation_duration_seconds',
      'Redis operation duration in seconds',
      ['operation'],
      {
        buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
      },
    );
    this.registerGauge('redis_cache_hit_rate', 'Redis cache hit rate');
    this.registerGauge(
      'redis_memory_usage_bytes',
      'Redis memory usage in bytes',
    );
    this.registerGauge(
      'redis_connected_clients',
      'Number of connected Redis clients',
    );
    this.registerGauge('redis_ops_per_second', 'Redis operations per second');

    this.registerCounter('cart_operations_total', 'Total cart operations', [
      'operation',
    ]);
    this.registerGauge('active_carts_total', 'Total number of active carts');

    this.registerCounter('product_views_total', 'Total product views', [
      'product_id',
    ]);
    this.registerCounter('product_cache_hits', 'Product cache hits', [
      'cache_type',
    ]);
    this.registerCounter('product_cache_misses', 'Product cache misses', [
      'cache_type',
    ]);
  }

  public setupRoutes(app: INestApplication): void {
    app.use('/metrics', (_, res: Response) => {
      res.set('Content-Type', this.registry.contentType);
      res.send(this.registry.metrics());
    });
  }

  public registerCounter(
    name: string,
    help: string,
    labelNames: string[] = [],
  ): prom.Counter<string> {
    const fullName = this.prefix + name;

    if (!this.counters.has(fullName)) {
      const counter = new prom.Counter({
        name: fullName,
        help,
        labelNames,
        registers: [this.registry],
      });

      this.counters.set(fullName, counter);
    }

    return this.counters.get(fullName);
  }

  public registerGauge(
    name: string,
    help: string,
    labelNames: string[] = [],
  ): prom.Gauge<string> {
    const fullName = this.prefix + name;

    if (!this.gauges.has(fullName)) {
      const gauge = new prom.Gauge({
        name: fullName,
        help,
        labelNames,
        registers: [this.registry],
      });

      this.gauges.set(fullName, gauge);
    }

    return this.gauges.get(fullName);
  }

  public registerHistogram(
    name: string,
    help: string,
    labelNames: string[] = [],
    options: { buckets?: number[] } = {},
  ): prom.Histogram<string> {
    const fullName = this.prefix + name;

    if (!this.histograms.has(fullName)) {
      const histogram = new prom.Histogram({
        name: fullName,
        help,
        labelNames,
        buckets: options.buckets,
        registers: [this.registry],
      });

      this.histograms.set(fullName, histogram);
    }

    return this.histograms.get(fullName);
  }

  public registerSummary(
    name: string,
    help: string,
    labelNames: string[] = [],
    options: { percentiles?: number[] } = {},
  ): prom.Summary<string> {
    const fullName = this.prefix + name;

    if (!this.summaries.has(fullName)) {
      const summary = new prom.Summary({
        name: fullName,
        help,
        labelNames,
        percentiles: options.percentiles,
        registers: [this.registry],
      });

      this.summaries.set(fullName, summary);
    }

    return this.summaries.get(fullName);
  }

  public incrementCounter(
    name: string,
    labels: Record<string, string> = {},
    value: number = 1,
  ): void {
    const fullName = this.prefix + name;
    const counter = this.counters.get(fullName);

    if (counter) {
      counter.inc(labels, value);
    }
  }

  public setGauge(
    name: string,
    value: number,
    labels: Record<string, string> = {},
  ): void {
    const fullName = this.prefix + name;
    const gauge = this.gauges.get(fullName);

    if (gauge) {
      gauge.set(labels, value);
    }
  }

  public incrementGauge(
    name: string,
    value: number = 1,
    labels: Record<string, string> = {},
  ): void {
    const fullName = this.prefix + name;
    const gauge = this.gauges.get(fullName);

    if (gauge) {
      gauge.inc(labels, value);
    }
  }

  public decrementGauge(
    name: string,
    value: number = 1,
    labels: Record<string, string> = {},
  ): void {
    const fullName = this.prefix + name;
    const gauge = this.gauges.get(fullName);

    if (gauge) {
      gauge.dec(labels, value);
    }
  }

  public observeHistogram(
    name: string,
    value: number,
    labels: Record<string, string> = {},
  ): void {
    const fullName = this.prefix + name;
    const histogram = this.histograms.get(fullName);

    if (histogram) {
      histogram.observe(labels, value);
    }
  }

  public startHistogramTimer(
    name: string,
    labels: Record<string, string> = {},
  ): () => number {
    const fullName = this.prefix + name;
    const histogram = this.histograms.get(fullName);

    if (histogram) {
      return histogram.startTimer(labels);
    }

    const start = process.hrtime();
    return () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      return seconds + nanoseconds / 1e9;
    };
  }

  public async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  public getContentType(): string {
    return this.registry.contentType;
  }
}
