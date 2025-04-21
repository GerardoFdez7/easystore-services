import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { CartItemAddedEvent } from '../cart-item-added.event';
import { RedisCacheAdapter } from '@infrastructure/cache/adapters/redis-cache.adapter';
import { PrometheusService } from '@infrastructure/metrics/prometheus.service';
import { ProductRepository } from '@infrastructure/repositories/product.repository';

@Injectable()
@EventsHandler(CartItemAddedEvent)
export class CartItemAddedHandler implements IEventHandler<CartItemAddedEvent> {
  private readonly logger = new Logger(CartItemAddedHandler.name);

  constructor(
    private readonly cacheAdapter: RedisCacheAdapter,
    private readonly productRepository: ProductRepository,
    private readonly metricsService: PrometheusService,
  ) {}

  async handle(event: CartItemAddedEvent): Promise<void> {
    const { userId, productId, quantity } = event;
    this.logger.log(
      `Product ${productId} added to cart for user ${userId} (quantity: ${quantity})`,
    );

    try {
      this.metricsService.incrementCounter('cart_operations_total', {
        operation: 'add_item',
      });
      this.metricsService.incrementCounter('product_added_to_cart_total', {
        productId,
      });

      this.metricsService.incrementGauge('active_carts_total');
      const product = await this.productRepository.findById(productId);
      if (!product) {
        this.logger.warn(`Product ${productId} not found`);
        return;
      }
      if (product && quantity > product.stock * 0.8) {
        // TODO: Caching high demand status for the product above 80% of stock
        await this.cacheAdapter.set(
          `product:${productId}:high_demand`,
          true,
          3600,
        );

        await this.cacheAdapter.invalidatePattern(`products:listing:*`);

        this.logger.log(
          `Product ${productId} marked as high demand due to cart addition of ${quantity} units`,
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error processing CartItemAddedEvent: ${errorMessage}`,
        errorStack,
      );
      this.metricsService.incrementCounter('cart_events_error_total', {
        event: 'cart_item_added',
      });
    }
  }
}
