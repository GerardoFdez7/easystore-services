import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EventSerializer } from '@infrastructure/transport/kafka/serializers/event-serializer';
import { BaseProducer } from '@infrastructure/transport/kafka/producers/base.producer';
import { OrderCreatedEvent } from '@domain/events/order-created.event';

@Injectable()
export class OrderCreatedProducer extends BaseProducer {
  private readonly topic: string;

  constructor(
    @Inject('KAFKA_CLIENT') kafkaClient: ClientKafka,
    configService: ConfigService,
    serializer: EventSerializer,
  ) {
    super(kafkaClient, configService, serializer);
    this.topic = this.configService.get<string>(
      'KAFKA_TOPIC_ORDER_CREATED',
      'ecommerce.orders.created',
    );
  }
  async publishOrderCreated(event: OrderCreatedEvent): Promise<unknown> {
    try {
      this.logger.log(
        `Publishing order created event for order ${event.orderId}`,
      );
      return await this.send(this.topic, event, event.orderId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error publishing order created event: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Error publishing order created event: Unknown error',
        );
      }
      throw error;
    }
  }
}
