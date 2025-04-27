import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import { GetOrderQuery } from '../get-order.query';

@Injectable()
@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: RedisCacheAdapter,
  ) {}

  async execute(query: GetOrderQuery): Promise<unknown> {
    const { orderNumber, userId } = query;

    const cacheKey = `order:${orderNumber}`;
    const cachedOrder = await this.cacheService.get(cacheKey);

    if (cachedOrder) {
      return cachedOrder;
    }

    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber,
        userId,
      },
      include: {
        orderDetails: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    const result = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.orderDate,
      items: order.orderDetails.map((detail) => ({
        productId: detail.productId,
        productName: detail.productName,
        quantity: detail.qty,
        unitPrice: Number(detail.unitPrice),
        subtotal: Number(detail.subtotal),
      })),
    };

    await this.cacheService.set(cacheKey, result, 3600);

    return result;
  }
}
