import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderItem } from '@domain/events/order-created.event';
import { PrismaService } from '@config/prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  async validateOrder(orderId: string, items: OrderItem[]): Promise<boolean> {
    this.logger.log(`Validating order ${orderId} with ${items.length} items`);

    const order = await this.prisma.order.findFirst({
      where: { orderNumber: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    for (const item of items) {
      // TODO: Add validation logic e.g., check if the product exists, has sufficient stock, etc.
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.productId}`);
      }
    }

    return true;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await this.prisma.order.update({
      where: { id: parseInt(orderId, 10) },
      data: {
        status: status as unknown,
        updatedAt: new Date(),
      },
    });
  }
}
