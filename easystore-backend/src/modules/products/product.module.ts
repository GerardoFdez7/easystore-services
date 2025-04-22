import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@prisma/prisma.module';
import { RedisCacheModule } from '@cache/redis.module';
import { KafkaModule } from '@transport/kafka/modules/kafka.module';
import { ProductRepository } from '@repositories/product.repository';
import { ProductUpdatedProducer } from '@transport/kafka/producers/product-updated.producer';
import { ProductResolver } from './interfaces/graphql/product.resolver';
import { GetProductHandler } from './application/queries/handlers/get-product.handler';
import { ListProductsHandler } from './application/queries/handlers/list-products.handler';
import { UpdateProductHandler } from './application/commands/handlers/update-product.handler';
import { ProductUpdatedHandler } from './application/events/handlers/product-updated.handler';

const QueryHandlers = [GetProductHandler, ListProductsHandler];
const CommandHandlers = [UpdateProductHandler];
const EventHandlers = [ProductUpdatedHandler];

@Module({
  imports: [CqrsModule, PrismaModule, RedisCacheModule, KafkaModule.register()],
  providers: [
    ProductResolver,
    ProductRepository,
    ...QueryHandlers,
    ...CommandHandlers,
    ...EventHandlers,
    ProductUpdatedProducer,
  ],
  exports: [ProductRepository],
})
export class ProductModule {}
