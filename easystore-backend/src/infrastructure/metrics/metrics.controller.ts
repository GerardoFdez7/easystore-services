import {
  Controller,
  Get,
  Header,
  Response as ResponseDecorator,
} from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { Response } from 'express';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  getMetrics(@ResponseDecorator() res: Response): void | Response {
    res.set('Content-Type', this.prometheusService.getContentType());
    return res.send(this.prometheusService.getMetrics());
  }
}
