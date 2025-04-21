import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisCacheAdapter } from '@infrastructure/cache/adapters/redis-cache.adapter';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class InvalidatePromotionCacheTask {
  private readonly logger = new Logger(InvalidatePromotionCacheTask.name);

  constructor(
    private readonly cacheAdapter: RedisCacheAdapter,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handlePromotionChanges(): Promise<void> {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);

      const startingPromotions = await this.prisma.promotion.findMany({
        where: {
          startDate: {
            gte: oneMinuteAgo,
            lte: now,
          },
        },
        select: {
          clientId: true,
          promotionProducts: {
            select: {
              productId: true,
            },
          },
          promotionCategories: {
            select: {
              categoryId: true,
            },
          },
        },
      });

      const endingPromotions = await this.prisma.promotion.findMany({
        where: {
          endDate: {
            gte: oneMinuteAgo,
            lte: now,
          },
        },
        select: {
          clientId: true,
          promotionProducts: {
            select: {
              productId: true,
            },
          },
          promotionCategories: {
            select: {
              categoryId: true,
            },
          },
        },
      });

      const promotionsToInvalidate = [
        ...startingPromotions,
        ...endingPromotions,
      ];

      for (const promotion of promotionsToInvalidate) {
        await this.cacheAdapter.invalidatePattern(
          `promotions:active:${promotion.clientId}:*`,
        );

        for (const { productId } of promotion.promotionProducts) {
          await this.cacheAdapter.invalidate(
            `product:${promotion.clientId}:${productId}`,
          );
        }

        for (const { categoryId } of promotion.promotionCategories) {
          await this.cacheAdapter.invalidatePattern(
            `products:${promotion.clientId}:${categoryId}:*`,
          );
        }
      }

      if (promotionsToInvalidate.length > 0) {
        this.logger.log(
          `Invalidated cache for ${promotionsToInvalidate.length} promotions`,
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error invalidating promotion cache: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Error invalidating promotion cache: Unknown error');
      }
    }
  }
}
