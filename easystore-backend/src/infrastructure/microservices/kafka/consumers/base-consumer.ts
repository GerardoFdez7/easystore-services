import { OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Consumer, EachMessagePayload, Kafka, KafkaMessage } from 'kafkajs';
import { EventSerializer } from '@shared/kafka/serializers/event-serializer';
import { LoggerService } from '@shared/winston/winston.service';
import { CircuitBreaker } from '@shared/redis/circuit-breaker';

export abstract class BaseConsumer implements OnModuleInit, OnModuleDestroy {
  protected consumer: Consumer;
  protected ready = false;
  protected readonly circuitBreaker: CircuitBreaker;

  constructor(
    @Inject('KAFKA_CLIENT') protected readonly kafkaClient: ClientKafka,
    protected readonly serializer: EventSerializer,
    protected readonly logger: LoggerService,
  ) {
    this.circuitBreaker = new CircuitBreaker({
      name: `kafka-consumer-${this.getTopic()}`,
      failureThreshold: 5,
      resetTimeout: 10000,
      onOpen: () =>
        this.logger.warn(
          `Kafka consumer circuit breaker opened for topic ${this.getTopic()}`,
        ),
      onClose: () =>
        this.logger.log(
          `Kafka consumer circuit breaker closed for topic ${this.getTopic()}`,
        ),
      onHalfOpen: () =>
        this.logger.log(
          `Kafka consumer circuit breaker half-open for topic ${this.getTopic()}`,
        ),
    });
  }

  abstract getTopic(): string;
  abstract getConsumerGroupId(): string;
  abstract handle(
    message: unknown,
    originalMessage: KafkaMessage,
  ): Promise<void>;

  async onModuleInit(): Promise<void> {
    const kafka: Kafka = this.kafkaClient.unwrap<Kafka>();

    const consumerGroupId = this.getConsumerGroupId();

    this.consumer = kafka.consumer({
      groupId: consumerGroupId,
      allowAutoTopicCreation: false,
    });

    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: this.getTopic(),
        fromBeginning: false,
      });

      await this.consumer.run({
        eachMessage: (payload: EachMessagePayload) => this.eachMessage(payload),
      });

      this.ready = true;
      this.logger.log(
        `Kafka consumer connected to topic ${this.getTopic()} with group ${consumerGroupId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Failed to initialize Kafka consumer for topic ${this.getTopic()}: ${errorMessage}`,
        error,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.ready = false;
      this.logger.log(
        `Kafka consumer disconnected from topic ${this.getTopic()}`,
      );
    }
  }

  private async eachMessage(payload: EachMessagePayload): Promise<void> {
    const {
      topic,
      partition,
      message,
    }: { topic: string; partition: number; message: KafkaMessage } = payload;
    const offset = message.offset;

    try {
      const deserializedMessage = await this.serializer.deserialize(
        message.value,
      );

      await this.circuitBreaker.execute(async () => {
        await this.handle(deserializedMessage, message);
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Error processing message from topic ${topic}, partition ${partition}, offset ${offset}: ${errorMessage}`,
        error,
      );
    }
  }
}
