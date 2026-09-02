import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { ResourceNotFoundError } from '@shared/infrastructure/postgres/errors';
import { Id } from '@shared/aggregates/value-objects';
import { handlePrismaDatabaseError } from '@shared/infrastructure/postgres/prisma-error-utils';
import { IWishListRepository } from '../../../aggregates/repositories/wish-list.interface';
import { WishListItem } from '../../../aggregates/value-objects';
import { WishListMapper } from '../../../application/mappers';

@Injectable()
export class WishListRepository implements IWishListRepository {
  constructor(private readonly postgresService: PostgreService) {}

  async findWishListItemByVariantId(
    customerId: Id,
    variantId: Id,
    tenantId: Id,
  ): Promise<WishListItem | null> {
    try {
      const wishListItemFound = await this.postgresService.wishList.findFirst({
        where: {
          customerId: customerId.getValue(),
          variantId: variantId.getValue(),
          tenantId: tenantId.getValue(),
        },
      });

      if (!wishListItemFound) return null;

      return WishListMapper.fromPersistence(wishListItemFound);
    } catch (error) {
      return this.handleDatabaseError(
        error,
        'find wishlist item by variant id',
      );
    }
  }

  async removeVariantFromWishList(
    customerId: Id,
    variantId: Id,
    tenantId: Id,
  ): Promise<WishListItem | null> {
    try {
      const wishListItem = await this.postgresService.$transaction(
        async (tx) => {
          const item = await tx.wishList.findFirst({
            where: {
              customerId: customerId.getValue(),
              variantId: variantId.getValue(),
              tenantId: tenantId.getValue(),
            },
          });

          if (!item) {
            return null;
          }

          await tx.wishList.delete({
            where: { id: item.id, tenantId: tenantId.getValue() },
          });

          return item;
        },
      );

      return wishListItem ? WishListMapper.fromPersistence(wishListItem) : null;
    } catch (error) {
      return this.handleDatabaseError(error, 'remove variant from wishlist');
    }
  }

  async removeManyFromWishList(
    customerId: Id,
    variantIds: Id[],
    tenantId: Id,
  ): Promise<WishListItem[]> {
    try {
      const wishListItems = await this.postgresService.$transaction(
        async (tx) => {
          const where = {
            customerId: customerId.getValue(),
            tenantId: tenantId.getValue(),
            variantId: {
              in: variantIds.map((id) => id.getValue()),
            },
          };
          const items = await tx.wishList.findMany({ where });

          if (items.length === 0) {
            throw new ResourceNotFoundError(
              'No wishlist items found for the provided variant IDs',
            );
          }

          await tx.wishList.deleteMany({ where });

          return items;
        },
      );

      return wishListItems.map((item) => WishListMapper.fromPersistence(item));
    } catch (error) {
      return this.handleDatabaseError(error, 'remove many from wishlist');
    }
  }

  /**
   * Creates a new wishlist item in the repository.
   * @param wishlistItem The wishlist item entity to create.
   * @returns Promise that resolves to the created WishListItem entity.
   */
  async create(wishlistItem: WishListItem): Promise<WishListItem> {
    try {
      const wishListData = WishListMapper.toPersistence(wishlistItem);

      const createdWishListItem = await this.postgresService.$transaction(
        async (tx) =>
          tx.wishList.create({
            data: {
              id: wishListData.id,
              variantId: wishListData.variantId,
              customerId: wishListData.customerId,
              tenantId: wishListData.tenantId,
              updatedAt: wishListData.updatedAt,
            },
          }),
      );

      return WishListMapper.fromPersistence(createdWishListItem);
    } catch (error) {
      return this.handleDatabaseError(error, 'create wishlist item');
    }
  }

  async findMany(customerId: Id, tenantId: Id): Promise<WishListItem[]> {
    try {
      const wishListItems = await this.postgresService.wishList.findMany({
        where: {
          customerId: customerId.getValue(),
          tenantId: tenantId.getValue(),
        },
        orderBy: { updatedAt: 'desc' },
      });

      return wishListItems.map((item) => WishListMapper.fromPersistence(item));
    } catch (error) {
      return this.handleDatabaseError(error, 'find many wish list items');
    }
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    return handlePrismaDatabaseError(error, operation, {
      resource: 'Wishlist Item',
      foreignKeyEntities: {
        customerId: 'Customer',
        variantId: 'Variant',
      },
    });
  }
}
