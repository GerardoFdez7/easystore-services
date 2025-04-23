import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import { CartRepository } from '@infrastructure/repositories/cart.repository';
import { PrismaService } from '@config/prisma/prisma.service';
import { AddToCartCommand } from '../../commands/add-to-cart.command';
import { CartItemAddedEvent } from '../../events/cart-item-added.event';

@Injectable()
@CommandHandler(AddToCartCommand)
export class AddToCartHandler implements ICommandHandler<AddToCartCommand> {
  constructor(
    private readonly redisCacheAdapter: RedisCacheAdapter,
    private readonly cartRepository: CartRepository,
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddToCartCommand): Promise<void> {
    const { userId, productId, quantity } = command;

    await this.redisCacheAdapter.addToCart(
      userId.toString(),
      productId.toString(),
      quantity,
    );

    await this.prisma.$transaction(async (prisma) => {
      let cart = await prisma.cart.findFirst({
        where: { userId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            qty: existingItem.qty + quantity,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            qty: quantity,
            updatedAt: new Date(),
          },
        });
      }
    });

    this.eventBus.publish(new CartItemAddedEvent(userId, productId, quantity));
  }
}
