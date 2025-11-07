import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';
import { DatabaseOperationError, ResourceNotFoundError } from '@shared/errors';
import { IWishListRepository } from '../../../aggregates/repositories/wish-list.interface';
import { WishListItem } from '../../../aggregates/value-objects';
import { Id } from '@shared/value-objects';
import { WishListMapper } from '../../../application/mappers';

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
  ): Promise<WishListItem | null> {
    try {
      const wishListItem = await this.postgresService.wishList.findFirst({
        where: {
          customerId: customerId.getValue(),
          variantId: variantId.getValue(),
        },
      });

      if (!wishListItem) {
        return null;
      }

      // Convert to domain object before deletion
      const wishListItemDomain = WishListMapper.fromPersistence(wishListItem);

      await this.postgresService.wishList.delete({
        where: {
          id: wishListItem.id,
        },
      });

      return wishListItemDomain;
    } catch (error) {
      return this.handleDatabaseError(error, 'remove variant from wishlist');
    }
  }

  async removeManyFromWishList(
    customerId: Id,
    variantIds: Id[],
  ): Promise<WishListItem[]> {
    try {
      // Convert Id objects to string values for the query
      const variantIdValues = variantIds.map((id) => id.getValue());
      const customerIdValue = customerId.getValue();

      // Find all wishlist items that match the criteria before deletion
      const wishListItems = await this.postgresService.wishList.findMany({
        where: {
          customerId: customerIdValue,
          variantId: {
            in: variantIdValues,
          },
        },
      });

      if (wishListItems.length === 0) {
        throw new ResourceNotFoundError(
          'No wishlist items found for the provided variant IDs',
        );
      }

      // Convert to domain objects before deletion
      const wishListItemDomains = wishListItems.map((item) =>
        WishListMapper.fromPersistence(item),
      );

      // Delete all matching items
      await this.postgresService.wishList.deleteMany({
        where: {
          customerId: customerIdValue,
          variantId: {
            in: variantIdValues,
          },
        },
      });

      return wishListItemDomains;
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
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

  async getManyWishListsByVariantIds(
    variantsIds: Id[],
    customerId: Id,
  ): Promise<WishListItem[]> {
    try {
      // Convert Id objects to string values for the query
      const variantIdValues = variantsIds.map((id) => id.getValue());
      const customerIdValue = customerId.getValue();

      // Find all wishlist items that match the criteria
      const wishListItems = await this.postgresService.wishList.findMany({
        where: {
          customerId: customerIdValue,
          variantId: {
            in: variantIdValues,
          },
        },
      });

      // Convert to domain objects and return
      return wishListItems.map((item) => WishListMapper.fromPersistence(item));
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }

      return this.handleDatabaseError(error, 'find wish lists by variant id');
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
