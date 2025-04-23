import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RedisCacheModule } from '@cache/redis.module';
import { PrometheusModule } from '@metrics/prometheus.module';
import { PrismaModule } from '@config/prisma/prisma.module';
import { CartRepository } from '@infrastructure/repositories/cart.repository';
import { CartResolver } from './interfaces/graphql/cart.resolver';
import { AddToCartHandler } from './application/commands/handlers/add-to-cart.handler';
import { GetCartHandler } from './application/commands/handlers/get-cart.handler';
import { ClearCartHandler } from './application/commands/handlers/clear-cart.handler';
import { CartClearedHandler } from './application/events/handlers/cart-cleared.handler';

const CommandHandlers = [AddToCartHandler, ClearCartHandler];
const QueryHandlers = [GetCartHandler];
const EventHandlers = [CartClearedHandler];

@Module({
  imports: [CqrsModule, RedisCacheModule, PrismaModule, PrometheusModule],
  providers: [
    CartResolver,
    CartRepository,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class CartModule {}
