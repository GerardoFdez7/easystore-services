import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaMessage } from 'kafkajs';
import { BaseConsumer } from '@infrastructure/transport/kafka/consumers/base-consumer';
import { EventSerializer } from '@infrastructure/transport/kafka/serializers/event-serializer';
import { ProductUpdatedEvent } from '@domain/events/product-updated.event';
import { RedisCacheAdapter } from '@infrastructure/cache/adapters/redis-cache.adapter';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@infrastructure/logging/winston/winston.service';

@Injectable()
export class ProductUpdatedConsumer extends BaseConsumer {
  private readonly topic: string;
  private readonly groupId: string;

  constructor(
    @Inject('KAFKA_CLIENT') kafkaClient: ClientKafka,
    serializer: EventSerializer,
    private readonly configService: ConfigService,
    private readonly cacheService: RedisCacheAdapter,
    protected readonly logger: LoggerService = console,
  ) {
    super(kafkaClient, serializer, logger);
    this.topic = this.configService.get<string>(
      'KAFKA_TOPIC_PRODUCT_UPDATED',
      'ecommerce.products.updated',
    );
    this.groupId = this.configService.get<string>(
      'KAFKA_GROUP_PRODUCT_CACHE',
      'product-cache-service',
    );
  }

  getTopic(): string {
    return this.topic;
  }

  getConsumerGroupId(): string {
    return this.groupId;
  }

  async handle(
    event: ProductUpdatedEvent,
    _originalMessage: KafkaMessage,
  ): Promise<void> {
    this.logger.log(`Processing product update for: ${event.productId}`);

    try {
      await this.cacheService.invalidate(`product:${event.productId}`);

      if (event.categoryId) {
        await this.cacheService.invalidatePattern(
          `products:category:${event.categoryId}:*`,
        );
      }

      await this.cacheService.set(
        `product:${event.productId}`,
        event.product,
        3600,
      );

      this.logger.log(`Product ${event.productId} cache updated successfully`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error updating product cache for ${event.productId}: ${errorMessage}`,
        errorStack,
      );
    }
  }
}
