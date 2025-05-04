// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { ClientKafka } from '@nestjs/microservices';
// import { KafkaConfigService } from '@transport/kafka/config/kafka-config.service';
// import { OrderCreatedProducer } from '@transport/kafka/producers/order-created.producer';
// import { EventSerializer } from '@transport/kafka/serializers/event-serializer';
// import { OrderCreatedEvent } from '../../../src/domain/events/order-created.event';
// import { CircuitBreaker } from '@cache/circuit-breaker';

// // Mock CircuitBreaker para tests
// jest.mock('../../../src/infra/resilience/circuit-breaker');
// const CircuitBreakerMock = CircuitBreaker;

// describe('Kafka Integration Test', () => {
//   let app: INestApplication;
//   let orderCreatedProducer: OrderCreatedProducer;
//   let kafkaClient: ClientKafka;
//   let configService: ConfigService;
//   let kafkaConfigService: KafkaConfigService;
//   let eventSerializer: EventSerializer;

//   beforeAll(async () => {
//     // Simular el comportamiento del CircuitBreaker
//     CircuitBreakerMock.prototype.execute.mockImplementation(
//       async (func) => await func(),
//     );

//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       providers: [
//         {
//           provide: ConfigService,
//           useValue: {
//             get: jest.fn((key, defaultValue) => {
//               const configs = {
//                 KAFKA_TOPIC_ORDER_CREATED: 'test.orders.created',
//                 KAFKA_ACKS: 1,
//                 KAFKA_COMPRESSION_TYPE: 'none',
//                 KAFKA_BROKERS: 'localhost:9092',
//               };
//               return configs[key] || defaultValue;
//             }),
//           },
//         },
//         KafkaConfigService,
//         EventSerializer,
//         {
//           provide: 'KAFKA_CLIENT',
//           useFactory: () => {
//             const mockKafkaClient = {
//               createClient: jest.fn().mockReturnValue({
//                 producer: jest.fn().mockReturnValue({
//                   connect: jest.fn().mockResolvedValue(undefined),
//                   send: jest.fn().mockResolvedValue([
//                     {
//                       topicName: 'test.orders.created',
//                       partition: 0,
//                       errorCode: 0,
//                     },
//                   ]),
//                   disconnect: jest.fn().mockResolvedValue(undefined),
//                 }),
//               }),
//             };
//             return mockKafkaClient;
//           },
//         },
//         OrderCreatedProducer,
//       ],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     await app.init();

//     orderCreatedProducer =
//       moduleFixture.get<OrderCreatedProducer>(OrderCreatedProducer);
//     kafkaClient = moduleFixture.get<ClientKafka>('KAFKA_CLIENT');
//     configService = moduleFixture.get<ConfigService>(ConfigService);
//     kafkaConfigService =
//       moduleFixture.get<KafkaConfigService>(KafkaConfigService);
//     eventSerializer = moduleFixture.get<EventSerializer>(EventSerializer);

//     await orderCreatedProducer.onModuleInit();
//   });

//   afterAll(async () => {
//     await orderCreatedProducer.onModuleDestroy();
//     await app.close();
//   });

//   it('should publish order created event', async () => {
//     // Arrange
//     const orderCreatedEvent: OrderCreatedEvent = {
//       orderId: 'test-order-123',
//       userId: 100,
//       clientId: 1,
//       items: [{ productId: 'prod-1', quantity: 2, price: 19.99 }],
//       totalAmount: 39.98,
//       timestamp: new Date().toISOString(),
//     };

//     const mockProducer = kafkaClient.createClient().producer();
//     const sendSpy = jest.spyOn(mockProducer, 'send');

//     // Act
//     await orderCreatedProducer.publishOrderCreated(orderCreatedEvent);

//     // Assert
//     expect(sendSpy).toHaveBeenCalled();

//     // Verificar que se llamó con los parámetros correctos
//     const sendArgs = sendSpy.mock.calls[0][0];
//     expect(sendArgs.topic).toBe('test.orders.created');
//     expect(sendArgs.messages.length).toBe(1);
//     expect(sendArgs.messages[0].key.toString()).toBe(orderCreatedEvent.orderId);

//     // Verificar serialización
//     const serializeSpy = jest.spyOn(eventSerializer, 'serialize');
//     expect(serializeSpy).toHaveBeenCalledWith(orderCreatedEvent);
//   });

//   it('should handle producer errors correctly', async () => {
//     // Arrange
//     const orderCreatedEvent: OrderCreatedEvent = {
//       orderId: 'test-order-123',
//       userId: 100,
//       clientId: 1,
//       items: [{ productId: 'prod-1', quantity: 2, price: 19.99 }],
//       totalAmount: 39.98,
//       timestamp: new Date().toISOString(),
//     };

//     const mockProducer = kafkaClient.createClient().producer();
//     jest
//       .spyOn(mockProducer, 'send')
//       .mockRejectedValueOnce(new Error('Test producer error'));

//     // Act & Assert
//     await expect(
//       orderCreatedProducer.publishOrderCreated(orderCreatedEvent),
//     ).rejects.toThrow('Test producer error');
//   });
// });
