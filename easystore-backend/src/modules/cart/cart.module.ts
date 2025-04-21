import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RedisCacheModule } from '@infrastructure/cache/redis.module';
import { PrometheusModule } from '@infrastructure/metrics/prometheus.module';
import { PrismaModule } from '@prisma/prisma.module';

import { CartResolver } from '@modules/cart/interfaces/graphql/cart.resolver';
import { CartRepository } from '@infrastructure/repositories/cart.repository';

import { AddToCartHandler } from '@modules/cart/application/commands/handlers/add-to-cart.handler';
import { GetCartHandler } from '@modules/cart/application/commands/handlers/get-cart.handler';
import { ClearCartHandler } from '@modules/cart/application/commands/handlers/clear-cart.handler';

import { CartClearedHandler } from '@modules/cart/application/events/handlers/cart-cleared.handler';

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
