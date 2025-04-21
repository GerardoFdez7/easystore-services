import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaConfigService } from '@infrastructure/transport/kafka/config/kafka-config.service';
import { OrderCreatedProducer } from '@infrastructure/transport/kafka/producers/order-created.producer';
import { EventSerializer } from '@infrastructure/transport/kafka/serializers/event-serializer';
import { OrderCreatedEvent } from '@domain/events/order-created.event';
import { CircuitBreaker } from '@infrastructure/cache/circuit-breaker';

jest.mock('@infrastructure/cache/circuit-breaker');
const CircuitBreakerMock = CircuitBreaker;

describe('Kafka Integration Test', () => {
  let app: INestApplication;
  let orderCreatedProducer: OrderCreatedProducer;
  let kafkaClient: ClientKafka;
  let eventSerializer: EventSerializer;

  beforeAll(async () => {
    CircuitBreakerMock.prototype.execute = jest.fn(
      async (func) => await func(),
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((): unknown => {
              const configs = {
                KAFKA_TOPIC_ORDER_CREATED: 'test.orders.created',
                KAFKA_ACKS: 1,
                KAFKA_COMPRESSION_TYPE: 'none',
                KAFKA_BROKERS: 'localhost:9092',
              };
              return (
                key: keyof typeof configs,
                defaultValue: unknown,
              ): unknown => {
                return configs[key] ?? defaultValue;
              };
            }),
          },
        },
        KafkaConfigService,
        EventSerializer,
        {
          provide: 'KAFKA_CLIENT',
          useFactory: () => {
            const mockKafkaClient = {
              createClient: jest.fn().mockReturnValue({
                producer: jest.fn().mockReturnValue({
                  connect: jest.fn().mockResolvedValue(undefined),
                  send: jest.fn().mockResolvedValue([
                    {
                      topicName: 'test.orders.created',
                      partition: 0,
                      errorCode: 0,
                    },
                  ]),
                  disconnect: jest.fn().mockResolvedValue(undefined),
                }),
              }),
            };
            return mockKafkaClient;
          },
        },
        OrderCreatedProducer,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    orderCreatedProducer =
      moduleFixture.get<OrderCreatedProducer>(OrderCreatedProducer);
    kafkaClient = moduleFixture.get<ClientKafka>('KAFKA_CLIENT');
    eventSerializer = moduleFixture.get<EventSerializer>(EventSerializer);

    await orderCreatedProducer.onModuleInit();
  });

  afterAll(async () => {
    await orderCreatedProducer.onModuleDestroy();
    await app.close();
  });

  it('should publish order created event', async () => {
    const orderCreatedEvent: OrderCreatedEvent = {
      orderId: 'test-order-123',
      userId: 100,
      clientId: 1,
      items: [{ productId: 'prod-1', quantity: 2, price: 19.99 }],
      totalAmount: 39.98,
      timestamp: new Date().toISOString(),
    };

    const mockProducer = kafkaClient.createClient().producer();
    const sendSpy = jest.spyOn(mockProducer, 'send');

    await orderCreatedProducer.publishOrderCreated(orderCreatedEvent);

    expect(sendSpy).toHaveBeenCalled();

    const sendArgs = sendSpy.mock.calls[0][0] as {
      topic: string;
      messages: { key: string }[];
    };
    expect(sendArgs.topic).toBe('test.orders.created');
    expect(sendArgs.messages.length).toBe(1);
    expect(sendArgs.messages[0].key.toString()).toBe(orderCreatedEvent.orderId);

    const serializeSpy = jest.spyOn(eventSerializer, 'serialize');
    expect(serializeSpy).toHaveBeenCalledWith(orderCreatedEvent);
  });

  it('should handle producer errors correctly', async () => {
    const orderCreatedEvent: OrderCreatedEvent = {
      orderId: 'test-order-123',
      userId: 100,
      clientId: 1,
      items: [{ productId: 'prod-1', quantity: 2, price: 19.99 }],
      totalAmount: 39.98,
      timestamp: new Date().toISOString(),
    };

    const mockProducer = kafkaClient.createClient().producer();
    jest
      .spyOn(mockProducer, 'send')
      .mockRejectedValueOnce(new Error('Test producer error'));

    await expect(
      orderCreatedProducer.publishOrderCreated(orderCreatedEvent),
    ).rejects.toThrow('Test producer error');
  });
});
