import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly prometheusService: PrometheusService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime();

    const method = req.method;
    const path = this.normalizePath(req.path);

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds + nanoseconds / 1e9;

      const status = res.statusCode.toString();

      this.prometheusService.incrementCounter('http_requests_total', {
        method,
        path,
        status,
      });

      this.prometheusService.observeHistogram(
        'http_request_duration_seconds',
        duration,
        {
          method,
          path,
        },
      );
    });

    next();
  }

  private normalizePath(path: string): string {
    return path.replace(/\/\d+/g, '/:id');
  }
}
