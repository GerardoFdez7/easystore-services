import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  Logger,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  Kafka,
  Producer,
  RecordMetadata,
  Message,
  CompressionTypes,
} from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { EventSerializer } from '../serializers/event-serializer';
import { MessageProducerPort } from './base.producer';
import { CircuitBreaker } from '@redis/circuit-breaker';

@Injectable()
export class MessageProducerService
  implements MessageProducerPort, OnModuleInit, OnModuleDestroy
{
  private producer: Producer;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly acks: number;
  private readonly compression: CompressionTypes;
  private ready = false;
  private readonly logger = new Logger(MessageProducerService.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly configService: ConfigService,
    private readonly serializer: EventSerializer,
  ) {
    this.acks = this.configService.get<number>('KAFKA_ACKS', -1);
    this.compression = this.getCompressionType();

    this.circuitBreaker = new CircuitBreaker({
      name: 'kafka-producer',
      failureThreshold: 3,
      resetTimeout: 10000,
      onOpen: () => this.logger.warn('Kafka producer circuit breaker opened'),
      onClose: () => this.logger.log('Kafka producer circuit breaker closed'),
      onHalfOpen: () =>
        this.logger.log('Kafka producer circuit breaker half-open'),
    });
  }

  async onModuleInit(): Promise<void> {
    const kafka: Kafka = this.kafkaClient.unwrap<Kafka>();
    this.producer = kafka.producer();

    try {
      await this.producer.connect();
      this.ready = true;
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to connect Kafka producer: ${errorMessage}`,
        error,
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error sending message to topic ${topic}: ${errorMessage}`,
        error,
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
      const kafkaMessages = messages.map((message) => {
        const serializedValue = this.serializer.serialize(message);
        return {
          key: getKey ? Buffer.from(getKey(message)) : null,
          value: serializedValue,
        } as Message;
      });

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
      this.logger.error(
        `Error sending batch to topic ${topic}: ${errorMessage}`,
        error,
      );
      throw error;
    }
  }

  async sendTransaction<T>(
    topicMessages: Array<{ topic: string; message: T; key?: string }>,
  ): Promise<void> {
    if (!this.ready) {
      throw new Error('Kafka producer is not connected');
    }

    const transaction = await this.producer.transaction();

    try {
      await Promise.all(
        topicMessages.map(async ({ topic, message, key }) => {
          const serializedValue = this.serializer.serialize(message);

          await transaction.send({
            topic,
            compression: this.compression,
            acks: this.acks,
            messages: [
              {
                key: key ? Buffer.from(key) : null,
                value: serializedValue,
              },
            ],
          });
        }),
      );

      await transaction.commit();
    } catch (error) {
      await transaction.abort();
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Transaction aborted: ${errorMessage}`, error);
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
