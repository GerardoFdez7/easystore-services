import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ClientKafka } from '@nestjs/microservices';
import { Kafka, Admin } from 'kafkajs';

@Injectable()
export class KafkaHealthIndicator
  extends HealthIndicatorService
  implements OnModuleInit, OnModuleDestroy
{
  private admin: Admin;
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    const kafka = this.kafkaClient.unwrap<Kafka>();
    this.admin = kafka.admin();
    await this.admin.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.admin) {
      await this.admin.disconnect();
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const topics = await this.admin.listTopics();
      const clusterId = await this.getClusterId();

      return this.getStatus(key, true, {
        topicsCount: topics.length,
        clusterId,
        responseTime: await this.measureResponseTime(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error(
        `Kafka health check failed: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return this.getStatus(key, false, { error: errorMessage });
    }
  }

  private async getClusterId(): Promise<string> {
    try {
      const metadata = await this.admin.describeCluster();
      return metadata.clusterId;
    } catch {
      return 'unknown';
    }
  }

  private async measureResponseTime(): Promise<number> {
    const start = Date.now();
    await this.admin.listTopics();
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
