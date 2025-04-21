import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaOptions, Transport } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { CompressionTypes, logLevel } from 'kafkajs';

@Injectable()
export class KafkaConfigService {
  constructor(private configService: ConfigService) {}

  createKafkaOptions(): KafkaOptions {
    const clientId = this.configService.get<string>(
      'KAFKA_CLIENT_ID',
      `ecommerce-service-${uuidv4()}`,
    );
    const brokers = this.getBrokers();

    return {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId,
          brokers,
          ssl: this.configService.get<boolean>('KAFKA_SSL_ENABLED', false),
          // sasl: this.getSaslConfig(),
          connectionTimeout: this.configService.get<number>(
            'KAFKA_CONNECTION_TIMEOUT',
            3000,
          ),
          requestTimeout: this.configService.get<number>(
            'KAFKA_REQUEST_TIMEOUT',
            30000,
          ),
          retry: {
            initialRetryTime: this.configService.get<number>(
              'KAFKA_INITIAL_RETRY_TIME',
              100,
            ),
            retries: this.configService.get<number>('KAFKA_RETRIES', 8),
          },
          logLevel:
            this.configService.get<string>('NODE_ENV', 'development') ===
            'production'
              ? logLevel.ERROR
              : logLevel.INFO,
        },
        consumer: {
          groupId: this.configService.get<string>(
            'KAFKA_CONSUMER_GROUP_ID',
            `${clientId}-group`,
          ),
          allowAutoTopicCreation: this.configService.get<boolean>(
            'KAFKA_ALLOW_AUTO_TOPIC_CREATION',
            false,
          ),
          sessionTimeout: this.configService.get<number>(
            'KAFKA_SESSION_TIMEOUT',
            30000,
          ),
          heartbeatInterval: this.configService.get<number>(
            'KAFKA_HEARTBEAT_INTERVAL',
            3000,
          ),
          maxBytesPerPartition: this.configService.get<number>(
            'KAFKA_MAX_BYTES_PER_PARTITION',
            1048576,
          ),
          maxWaitTimeInMs: this.configService.get<number>(
            'KAFKA_MAX_WAIT_TIME',
            5000,
          ),
          retry: {
            initialRetryTime: this.configService.get<number>(
              'KAFKA_CONSUMER_INITIAL_RETRY_TIME',
              300,
            ),
            retries: this.configService.get<number>(
              'KAFKA_CONSUMER_RETRIES',
              10,
            ),
          },
        },
        producer: {
          allowAutoTopicCreation: this.configService.get<boolean>(
            'KAFKA_ALLOW_AUTO_TOPIC_CREATION',
            false,
          ),
          transactionalId: this.configService.get<string>(
            'KAFKA_TRANSACTIONAL_ID',
            `${clientId}-tx`,
          ),
          idempotent: this.configService.get<boolean>(
            'KAFKA_IDEMPOTENCE_ENABLED',
            true,
          ),
          maxInFlightRequests: this.configService.get<number>(
            'KAFKA_MAX_IN_FLIGHT',
            5,
          ),
          retry: {
            initialRetryTime: this.configService.get<number>(
              'KAFKA_PRODUCER_INITIAL_RETRY_TIME',
              100,
            ),
            retries: this.configService.get<number>(
              'KAFKA_PRODUCER_RETRIES',
              8,
            ),
          },
        },
        subscribe: {
          fromBeginning: this.configService.get<boolean>(
            'KAFKA_FROM_BEGINNING',
            false,
          ),
        },
        send: {
          timeout: this.configService.get<number>('KAFKA_SEND_TIMEOUT', 30000),
          acks: this.configService.get<number>('KAFKA_ACKS', -1), // -1 = all brokers acknowledged
        },
        run: {
          partitionsConsumedConcurrently: this.configService.get<number>(
            'KAFKA_PARTITIONS_CONSUMED_CONCURRENTLY',
            3,
          ),
        },
      },
    };
  }

  private getBrokers(): string[] {
    const brokersStr = this.configService.get<string>(
      'KAFKA_BROKERS',
      'localhost:9092',
    );
    return brokersStr.split(',').map((broker) => broker.trim());
  }

  private getSaslConfig():
    | {
        mechanism: string;
        username: string;
        password: string;
        authenticationProvider?: (args: unknown) => unknown;
      }
    | undefined {
    const saslEnabled = this.configService.get<boolean>(
      'KAFKA_SASL_ENABLED',
      false,
    );

    if (!saslEnabled) {
      return undefined;
    }

    return {
      mechanism: this.configService.get<string>(
        'KAFKA_SASL_MECHANISM',
        'plain',
      ),
      username: this.configService.get<string>('KAFKA_SASL_USERNAME', ''),
      password: this.configService.get<string>('KAFKA_SASL_PASSWORD', ''),
      authenticationProvider: () => ({
        authenticate: async () => {
          // TODO: Implement authentication logic here if needed
          return Promise.resolve();
        },
      }),
    };
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
}
