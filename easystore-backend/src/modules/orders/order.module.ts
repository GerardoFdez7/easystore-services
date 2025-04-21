import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@prisma/prisma.module';
import { RedisCacheModule } from '@infrastructure/cache/redis.module';
import { KafkaModule } from '@infrastructure/transport/kafka/modules/kafka.module';
import { OrderResolver } from '@modules/orders/interfaces/graphql/order.resolver';
import { OrderService } from '@application/services/order.service';
import { CreateOrderHandler } from '@modules/orders/application/commands/handlers/create-order.handler';
import { GetOrderHandler } from '@modules/orders/application/queries/handlers/get-order.handler';
import { OrderCreatedProducer } from '@infrastructure/transport/kafka/producers/order-created.producer';

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
