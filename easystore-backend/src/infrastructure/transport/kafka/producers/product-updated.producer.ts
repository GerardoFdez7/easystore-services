import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EventSerializer } from '@infrastructure/transport/kafka/serializers/event-serializer';
import { BaseProducer } from '@infrastructure/transport/kafka/producers/base.producer';
import { ProductUpdatedEvent } from '@domain/events/product-updated.event';

@Injectable()
export class ProductUpdatedProducer extends BaseProducer {
  private readonly topic: string;

  constructor(
    @Inject('KAFKA_CLIENT') kafkaClient: ClientKafka,
    configService: ConfigService,
    serializer: EventSerializer,
  ) {
    super(kafkaClient, configService, serializer);
    this.topic = this.configService.get<string>(
      'KAFKA_TOPIC_PRODUCT_UPDATED',
      'ecommerce.products.updated',
    );
  }

  async publishProductUpdated(event: ProductUpdatedEvent): Promise<unknown> {
    try {
      this.logger.log(
        `Publishing product updated event for product ${event.productId}`,
      );
      return await this.send(this.topic, event, event.productId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error publishing product updated event: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
