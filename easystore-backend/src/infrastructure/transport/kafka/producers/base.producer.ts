import { OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  Producer,
  RecordMetadata,
  Message,
  CompressionTypes,
  Kafka,
} from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { EventSerializer } from '@infrastructure/transport/kafka/serializers/event-serializer';
import { MessageProducerPort } from '@application/ports/messaging/message-producer.port';
import { CircuitBreaker } from '@infrastructure/cache/circuit-breaker';

export abstract class BaseProducer
  implements MessageProducerPort, OnModuleInit, OnModuleDestroy
{
  protected producer: Producer;
  protected readonly circuitBreaker: CircuitBreaker;
  protected readonly acks: number;
  protected readonly compression: CompressionTypes;
  protected ready = false;
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject('KAFKA_CLIENT') protected readonly kafkaClient: ClientKafka,
    protected readonly configService: ConfigService,
    protected readonly serializer: EventSerializer,
  ) {
    this.acks = this.configService.get<number>('KAFKA_ACKS', -1);
    this.compression = this.getCompressionType();

    this.circuitBreaker = new CircuitBreaker({
      name: `kafka-producer-${this.constructor.name}`,
      failureThreshold: 3,
      resetTimeout: 10000,
      onOpen: () => this.logger.warn('Kafka producer circuit breaker opened'),
      onClose: () => this.logger.log('Kafka producer circuit breaker closed'),
      onHalfOpen: () =>
        this.logger.log('Kafka producer circuit breaker half-open'),
    });
  }
  sendTransaction<T>(
    _topicMessages: Array<{ topic: string; message: T; key?: string }>,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async onModuleInit(): Promise<void> {
    const kafka: Kafka = this.kafkaClient.unwrap<Kafka>();

    this.producer = kafka.producer({
      allowAutoTopicCreation: false,
    });

    try {
      await this.producer.connect();
      this.ready = true;
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to connect Kafka producer: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.ready = false;
    }
  }

  private getCompressionType(): CompressionTypes {
    const compression = this.configService.get<string>(
      'KAFKA_COMPRESSION_TYPE',
      'snappy',
    );

    switch (compression.toLowerCase()) {
      case 'gzip':
        return CompressionTypes.GZIP;
      case 'snappy':
        return CompressionTypes.Snappy;
      case 'lz4':
        return CompressionTypes.LZ4;
      default:
        return CompressionTypes.None;
    }
  }

  async send<T>(
    topic: string,
    message: T,
    key?: string,
    headers?: Record<string, string>,
  ): Promise<RecordMetadata[]> {
    if (!this.ready) {
      throw new Error('Kafka producer is not connected');
    }

    try {
      const serializedValue = this.serializer.serialize(message);

      const kafkaMessage: Message = {
        key: key ? Buffer.from(key) : null,
        value: serializedValue,
        headers: this.prepareHeaders(headers),
      };

      return await this.circuitBreaker.execute(async () => {
        return this.producer.send({
          topic,
          compression: this.compression,
          acks: this.acks,
          messages: [kafkaMessage],
        });
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error sending message to topic ${topic}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async sendBatch<T>(
    topic: string,
    messages: T[],
    getKey?: (message: T) => string,
  ): Promise<RecordMetadata[]> {
    if (!this.ready) {
      throw new Error('Kafka producer is not connected');
    }

    try {
      const kafkaMessages = await Promise.all(
        messages.map((message) => {
          const serializedValue = this.serializer.serialize(message);
          return {
            key: getKey ? Buffer.from(getKey(message)) : null,
            value: serializedValue,
          } as Message;
        }),
      );

      return await this.circuitBreaker.execute(async () => {
        return this.producer.send({
          topic,
          compression: this.compression,
          acks: this.acks,
          messages: kafkaMessages,
        });
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error sending batch to topic ${topic}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  private prepareHeaders(
    headers?: Record<string, string>,
  ): Record<string, Buffer> | undefined {
    if (!headers) {
      return undefined;
    }

    return Object.entries(headers).reduce(
      (acc, [key, value]) => {
        acc[key] = Buffer.from(value);
        return acc;
      },
      {} as Record<string, Buffer>,
    );
  }
}
