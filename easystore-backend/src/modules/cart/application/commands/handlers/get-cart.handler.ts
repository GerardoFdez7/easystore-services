import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetCartQuery } from '../../queries/get-cart.query';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import { CartRepository } from '@infrastructure/repositories/cart.repository';
import { CartDto } from '../../../interfaces/graphql/dto/cart.dto';
import { PrismaService } from '@config/prisma/prisma.service';

@Injectable()
@QueryHandler(GetCartQuery)
export class GetCartHandler implements IQueryHandler<GetCartQuery> {
  constructor(
    private readonly redisCacheAdapter: RedisCacheAdapter,
    private readonly cartRepository: CartRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetCartQuery): Promise<CartDto> {
    const { userId } = query;

    const cachedCart = await this.redisCacheAdapter.getCart(userId.toString());

    if (Object.keys(cachedCart).length > 0) {
      const items = await Promise.all(
        Object.entries(cachedCart).map(([productId, quantity]) => {
          return {
            productId,
            quantity,
          };
        }),
      );

      return { userId, items };
    }

    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: true,
      },
    });

    if (!cart) {
      return { userId, items: [] };
    }

    for (const item of cart.cartItems) {
      await this.redisCacheAdapter.addToCart(
        userId.toString(),
        item.productId.toString(),
        item.qty,
      );
    }

    const items = cart.cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.qty,
    }));

    return { userId, items };
  }
}
