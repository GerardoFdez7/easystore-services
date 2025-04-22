import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@prisma/prisma.module';
import { RedisCacheModule } from '@cache/redis.module';
import { OrderService } from '@application/services/order.service';
import { KafkaModule } from '@transport/kafka/modules/kafka.module';
import { OrderCreatedProducer } from '@transport/kafka/producers/order-created.producer';
import { OrderResolver } from './interfaces/graphql/order.resolver';
import { CreateOrderHandler } from './application/commands/handlers/create-order.handler';
import { GetOrderHandler } from './application/queries/handlers/get-order.handler';

const CommandHandlers = [CreateOrderHandler];
const QueryHandlers = [GetOrderHandler];

@Module({
  imports: [CqrsModule, PrismaModule, RedisCacheModule, KafkaModule.register()],
  providers: [
    OrderService,
    OrderResolver,
    ...CommandHandlers,
    ...QueryHandlers,
    OrderCreatedProducer,
  ],
  exports: [OrderService],
})
export class OrderModule {}
