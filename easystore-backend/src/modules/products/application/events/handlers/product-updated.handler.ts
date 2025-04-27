import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import { ProductUpdatedEvent } from '../product-updated.event';

@Injectable()
@EventsHandler(ProductUpdatedEvent)
export class ProductUpdatedHandler
  implements IEventHandler<ProductUpdatedEvent>
{
  private readonly logger = new Logger(ProductUpdatedHandler.name);

  constructor(private readonly cacheAdapter: RedisCacheAdapter) {}

  async handle(event: ProductUpdatedEvent): Promise<void> {
    const { productId, clientId, categoryId, product } = event;

    try {
      this.logger.log(
        `Handling product updated event for product ${productId}`,
      );

      const productCacheKey = `product:${clientId}:${productId}`;
      await this.cacheAdapter.set(productCacheKey, product, 3600);

      await this.cacheAdapter.invalidatePattern(`products:${clientId}:all:*`);
      await this.cacheAdapter.invalidatePattern(
        `products:${clientId}:${categoryId}:*`,
      );

      // TODO: Update all carts that contain this product
      this.logger.log(`Successfully updated cache for product ${productId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error handling product updated event: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'Error handling product updated event: Unknown error',
        );
      }
    }
  }

  // TODO: Impleent logic to update all carts that contain this product
  // private async updateCartsWithProduct(productId: string, product: ProductData): Promise<void> {
  //
  // }
}
