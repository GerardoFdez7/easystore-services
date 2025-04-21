import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaMessage } from 'kafkajs';
import { BaseConsumer } from './base-consumer';
import { EventSerializer } from '../serializers/event-serializer';
import { OrderCreatedEvent } from '@domain/events/order-created.event';
import { OrderService } from '@application/services/order.service';
import { InventoryService } from '@application/services/inventory.service';
import { RedisCacheAdapter } from '@infrastructure/cache/adapters/redis-cache.adapter';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@infrastructure/logging/winston/winston.service';

@Injectable()
export class OrderCreatedConsumer extends BaseConsumer {
  private readonly topic: string;
  private readonly groupId: string;

  constructor(
    @Inject('KAFKA_CLIENT') kafkaClient: ClientKafka,
    serializer: EventSerializer,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
    private readonly inventoryService: InventoryService,
    private readonly cacheService: RedisCacheAdapter,
    protected readonly logger: LoggerService,
  ) {
    super(kafkaClient, serializer, logger);
    this.topic = this.configService.get<string>(
      'KAFKA_TOPIC_ORDER_CREATED',
      'ecommerce.orders.created',
    );
    this.groupId = this.configService.get<string>(
      'KAFKA_GROUP_ORDER_PROCESSING',
      'order-processing-service',
    );
  }

  getTopic(): string {
    return this.topic;
  }

  getConsumerGroupId(): string {
    return this.groupId;
  }

  async handle(
    event: OrderCreatedEvent,
    _originalMessage: KafkaMessage,
  ): Promise<void> {
    this.logger.log(`Processing new order: ${event.orderId}`);

    await this.orderService.validateOrder(event.orderId, event.items);

    await this.inventoryService.reserveInventory(event.items);

    await this.cacheService.set(
      `order:${event.orderId}:status`,
      {
        status: 'PROCESSING',
        updatedAt: new Date().toISOString(),
        items: event.items,
      },
      3600,
    );

    const productIds = event.items.map((item) => item.productId);
    for (const productId of productIds) {
      await this.cacheService.invalidatePattern(`product:${productId}:*`);
    }

    this.logger.log(`Order ${event.orderId} processed successfully`);
  }
}
