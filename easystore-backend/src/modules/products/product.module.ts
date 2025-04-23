import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@config/prisma/prisma.module';
import { RedisCacheModule } from '@infrastructure/cache/redis.module';
import { KafkaModule } from '@infrastructure/transport/kafka/modules/kafka.module';
import { ProductResolver } from '@modules/products/interfaces/graphql/product.resolver';
import { ProductRepository } from '@infrastructure/repositories/product.repository';
import { GetProductHandler } from '@modules/products/application/queries/handlers/get-product.handler';
import { ListProductsHandler } from '@modules/products/application/queries/handlers/list-products.handler';
import { UpdateProductHandler } from '@modules/products/application/commands/handlers/update-product.handler';
import { ProductUpdatedHandler } from '@modules/products/application/events/handlers/product-updated.handler';
import { ProductUpdatedProducer } from '@infrastructure/transport/kafka/producers/product-updated.producer';

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
