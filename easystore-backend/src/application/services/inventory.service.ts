import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { OrderItem } from '@domain/events/order-created.event';
import { PrismaService } from '@prisma/prisma.service';
import { RedisCacheAdapter } from '@/infrastructure/cache/adapters/redis-cache.adapter';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: RedisCacheAdapter,
  ) {}
  async reserveInventory(items: OrderItem[]): Promise<void> {
    this.logger.log(`Reserving inventory for ${items.length} items`);

    try {
      // TODO: Invetory DB implementation
      for (const item of items) {
        this.logger.log(
          `Reserved ${item.quantity} units of product ${item.productId}`,
        );

        // await this.prisma.$transaction(async (prisma) => {
        //   const stock = await prisma.warehouse.findFirst({
        //     where: { productId: item.productId }
        //   });
        //
        //   if (!stock || stock.quantity < item.quantity) {
        //     throw new Error(`Insufficient stock for product ${item.productId}`);
        //   }
        //
        //   await prisma.warehouse.update({
        //     where: { id: stock.id },
        //     data: { quantity: stock.quantity - item.quantity }
        //   });
        //
        //   await prisma.stockMovement.create({
        //     data: {
        //       productId: item.productId,
        //       warehouseId: stock.warehouseId,
        //       deltaQty: -item.quantity,
        //       reason: Buffer.from(JSON.stringify({ type: 'order', orderId: orderId })),
        //     }
        //   });
        // });

        const cacheKey = `inventory:${item.productId}`;
        await this.cacheService.invalidate(cacheKey);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error reserving inventory: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error reserving inventory: Unknown error');
      }
      throw error;
    }
  }

  async returnInventory(items: OrderItem[]): Promise<void> {
    this.logger.log(`Returning inventory for ${items.length} items`);

    try {
      for (const item of items) {
        this.logger.log(
          `Returned ${item.quantity} units of product ${item.productId}`,
        );

        const cacheKey = `inventory:${item.productId}`;
        await this.cacheService.invalidate(cacheKey);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error returning inventory: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error returning inventory: Unknown error');
      }
      throw error;
    }
  }
}
