import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ProductRepository } from '@repositories/product.repository';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import {
  ProductData,
  ProductUpdatedEvent,
} from '@domain/events/product-updated.event';
import { ProductUpdatedProducer } from '@transport/kafka/producers/product-updated.producer';
import { UpdateProductCommand } from '../update-product.command';

@Injectable()
@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand>
{
  private readonly logger = new Logger(UpdateProductHandler.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cacheAdapter: RedisCacheAdapter,
    private readonly productUpdatedProducer: ProductUpdatedProducer,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateProductCommand): Promise<unknown> {
    const { id, clientId, data } = command;

    try {
      const updatedProduct = await this.productRepository.update(
        id,
        clientId,
        data,
      );

      if (!updatedProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.cacheAdapter.invalidate(`product:${clientId}:${id}`);

      if (
        'categoryId' in data &&
        data.categoryId &&
        updatedProduct &&
        data.categoryId !== updatedProduct.categoryId
      ) {
        await this.cacheAdapter.invalidatePattern(
          `products:${clientId}:${updatedProduct.categoryId}:*`,
        );
      }
      await this.cacheAdapter.invalidatePattern(`products:${clientId}:all:*`);
      if (data.categoryId) {
        await this.cacheAdapter.invalidatePattern(
          `products:${clientId}:${data.categoryId}:*`,
        );
      }

      const productData: ProductData = {
        ...updatedProduct,
      };

      const productUpdatedEvent = new ProductUpdatedEvent(
        id,
        clientId,
        data.categoryId || updatedProduct.categoryId,
        productData,
      );

      await this.productUpdatedProducer.publishProductUpdated(
        productUpdatedEvent,
      );

      this.eventBus.publish(productUpdatedEvent);

      this.logger.log(`Product ${id} updated and event published to Kafka`);

      return updatedProduct;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error updating product ${id}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
