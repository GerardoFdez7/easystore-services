import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ClearCartCommand } from '../../commands/clear-cart.command';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import { CartClearedEvent } from '../../events/cart-cleared.event';
import { PrismaService } from '@config/prisma/prisma.service';
import { PrometheusService } from '@metrics/prometheus.service';

@Injectable()
@CommandHandler(ClearCartCommand)
export class ClearCartHandler implements ICommandHandler<ClearCartCommand> {
  constructor(
    private readonly redisCacheAdapter: RedisCacheAdapter,
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
    private readonly metricsService: PrometheusService,
  ) {}

  async execute(command: ClearCartCommand): Promise<void> {
    const { userId }: { userId: number } = command;
    const timer = this.metricsService.startHistogramTimer(
      'cart_operation_duration_seconds',
      {
        operation: 'clear',
      },
    );

    try {
      await this.redisCacheAdapter.clearCart(Number(userId));

      await this.prisma.$transaction(async (prisma) => {
        const cart = await prisma.cart.findFirst({
          where: { userId: Number(userId) },
          select: { id: true },
        });

        if (cart) {
          await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
          });
        }
      });

      this.eventBus.publish(new CartClearedEvent(Number(userId)));

      this.metricsService.incrementCounter('cart_operations_total', {
        operation: 'clear',
      });
    } catch (error) {
      this.metricsService.incrementCounter('cart_operation_errors', {
        operation: 'clear',
      });
      throw error;
    } finally {
      timer();
    }
  }
}
