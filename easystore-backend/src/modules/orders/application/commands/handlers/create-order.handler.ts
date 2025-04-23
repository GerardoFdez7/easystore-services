import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateOrderCommand } from '@modules/orders/application/commands/create-order.command';
import { PrismaService } from '@config/prisma/prisma.service';
import { OrderCreatedProducer } from '@infrastructure/transport/kafka/producers/order-created.producer';
import { OrderCreatedEvent } from '@domain/events/order-created.event';
import { RedisCacheAdapter } from '@infrastructure/cache/adapters/redis-cache.adapter';
import { Logger } from '@nestjs/common';
import { OrderDto } from '@modules/orders/interfaces/graphql/dto/order.dto';

@Injectable()
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderCreatedProducer: OrderCreatedProducer,
    private readonly cacheService: RedisCacheAdapter,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    const { userId, cartId, addressId } = command;

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const cart = await prisma.cart.findUnique({
          where: { id: Number(cartId) },
          include: { cartItems: true },
        });

        if (!cart || cart.userId !== userId) {
          throw new Error('Cart not found or does not belong to this user');
        }

        if (cart.cartItems.length === 0) {
          throw new Error('Cannot create order with empty cart');
        }

        let totalAmount = 0;
        for (const item of cart.cartItems) {
          // TODO: Retrieve product price from the database
          const productPrice = 10;
          totalAmount += productPrice * item.qty;
        }

        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${userId}`,
            userId,
            cartId: Number(cartId),
            orderDate: new Date(),
            status: 'PROCESSING',
            totalAmount,
            addressId: Number(addressId),
            updatedAt: new Date(),
          },
        });

        const orderDetails = [];
        for (const item of cart.cartItems) {
          const productPrice = 10;
          const productName = `Producto ${item.productId}`;

          const detail = await prisma.orderDetail.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              productName,
              qty: item.qty,
              unitPrice: productPrice,
              subtotal: productPrice * item.qty,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          orderDetails.push(detail);
        }

        return { order, orderDetails, cart };
      });

      const { order, orderDetails } = result;

      await this.cacheService.clearCart(userId);

      const items = orderDetails.map(
        (detail: { productId: string; qty: number; unitPrice: number }) => ({
          productId: detail.productId,
          quantity: detail.qty,
          price: detail.unitPrice,
        }),
      );

      const orderCreatedEvent = new OrderCreatedEvent(
        order.orderNumber,
        userId,
        order.id,
        items,
        order.totalAmount.toNumber(),
        new Date().toISOString(),
      );

      await this.orderCreatedProducer.publishOrderCreated(orderCreatedEvent);

      this.eventBus.publish(orderCreatedEvent);

      this.logger.log(
        `Order ${order.orderNumber} created and published to Kafka`,
      );

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.orderDate,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error creating order: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('An unknown error occurred');
      }
      throw error;
    }
  }
}
