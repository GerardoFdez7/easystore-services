import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';
import { DatabaseOperationError, ResourceNotFoundError } from '@shared/errors';
import { IWishListRepository } from 'src/domains/customer/aggregates/repositories/wish-list.interface';
import { WishListItem } from 'src/domains/customer/aggregates/value-objects';
import { WishListMapper } from '../../../application/mappers/wish-list';
import { Id } from '@shared/value-objects';

@Injectable()
export class WishListRepository implements IWishListRepository {
  constructor(private readonly postgresService: PostgreService) {}

  async findWishListItemByVariantId(
    variantId: Id,
  ): Promise<WishListItem | null> {
    try {
      const wishListItemFound = await this.postgresService.wishList.findFirst({
        where: { variantId: variantId.getValue() },
      });

      if (!wishListItemFound) return null;

      return WishListMapper.fromPersistence(wishListItemFound);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }

      return this.handleDatabaseError(
        error,
        'find wishlist item by variant id',
      );
    }
  }

  async removeVariantFromWishList(
    customerId: Id,
    variantId: Id,
  ): Promise<void> {
    try {
      const wishListItem = await this.postgresService.wishList.findFirst({
        where: {
          customerId: customerId.getValue(),
          variantId: variantId.getValue(),
        },
      });

      if (!wishListItem) {
        throw new ResourceNotFoundError('WishList item');
      }

      await this.postgresService.wishList.delete({
        where: {
          id: wishListItem.id,
        },
      });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'remove variant from wishlist');
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

      const createdWishListItem = await this.postgresService.wishList.create({
        data: {
          id: wishListData.id,
          variantId: wishListData.variantId,
          customerId: wishListData.customerId,
          updatedAt: wishListData.updatedAt,
        },
      });

      return WishListMapper.fromPersistence(createdWishListItem);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violations or other known Prisma errors
        if (error.code === 'P2002') {
          throw new DatabaseOperationError(
            'create wishlist item',
            'Wishlist item already exists for this customer and variant',
            error,
          );
        }
        if (error.code === 'P2003') {
          throw new DatabaseOperationError(
            'create wishlist item',
            'Referenced customer or variant does not exist',
            error,
          );
        }
      }

      return this.handleDatabaseError(error, 'create wishlist item');
    }
  }

  /**
   * Centralized error handling for database operations
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new DatabaseOperationError(
      operation,
      errorMessage,
      error instanceof Error ? error : new Error(errorMessage),
    );
  }
}
