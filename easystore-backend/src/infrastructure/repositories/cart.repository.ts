import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<unknown> {
    return this.prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: true,
      },
    });
  }

  async addItem(
    userId: number,
    productId: string,
    quantity: number,
  ): Promise<unknown> {
    return this.prisma.$transaction(async (prisma) => {
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
        return prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            qty: existingItem.qty + quantity,
            updatedAt: new Date(),
          },
        });
      } else {
        return prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            qty: quantity,
            updatedAt: new Date(),
          },
        });
      }
    });
  }

  async removeAllItems(userId: number): Promise<void> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  }

  async deleteCart(userId: number): Promise<void> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await this.prisma.cart.delete({
        where: { id: cart.id },
      });
    }
  }
}
