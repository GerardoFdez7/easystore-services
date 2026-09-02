import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Id } from '@shared/aggregates/value-objects';
import { FindWishlistItemsDto } from './find-wish-list-items.dto';
import { IWishListRepository } from '../../../../aggregates/repositories/wish-list.interface';
import { IProductAdapter } from '../../../ports';
import {
  PaginatedWishlistDTO,
  WishlistItemWithVariantDTO,
} from '../../../mappers/wish-list/wish-list.dto';
import { WishListMapper } from '../../../mappers/wish-list/wish-list.mapper';
import { enrichWithVariantDetails } from '../../../shared/enrich-with-variant-details';
import { SortOrder } from '@shared/aggregates/value-objects';
import { WishListSortBy } from './find-wish-list-items.dto';

@QueryHandler(FindWishlistItemsDto)
export class FindWishListItemsHandler
  implements IQueryHandler<FindWishlistItemsDto>
{
  constructor(
    @Inject('IWishListRepository')
    private readonly wishListRepository: IWishListRepository,
    @Inject('IProductAdapter')
    private readonly productAdapter: IProductAdapter,
  ) {}

  async execute(query: FindWishlistItemsDto): Promise<PaginatedWishlistDTO> {
    const customerId = Id.create(query.customerId);
    const tenantId = Id.create(query.tenantId);

    const wishListItems = await this.wishListRepository.findMany(
      customerId,
      tenantId,
    );

    if (wishListItems.length === 0) {
      return { wishlistItems: [], total: 0, hasMore: false };
    }

    const wishListDtos = wishListItems.map((item) =>
      WishListMapper.toDto(item),
    );
    const variantIdStrings = wishListDtos.map((item) => item.variantId);
    const variantDetails =
      await this.productAdapter.getVariantsDetails(variantIdStrings);
    const sortedItems = this.sortWishListItems(
      enrichWithVariantDetails(wishListDtos, variantDetails),
      query.sortBy,
      query.sortOrder,
    );
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;
    const paginatedItems = sortedItems.slice(offset, offset + limit);

    return {
      wishlistItems: paginatedItems,
      total: sortedItems.length,
      hasMore: offset + paginatedItems.length < sortedItems.length,
    };
  }

  private sortWishListItems(
    items: WishlistItemWithVariantDTO[],
    sortBy: WishListSortBy | undefined,
    sortOrder: SortOrder | undefined,
  ): WishlistItemWithVariantDTO[] {
    const resolvedSortBy = sortBy ?? WishListSortBy.ADDED_AT;
    const resolvedSortOrder =
      sortOrder ??
      (resolvedSortBy === WishListSortBy.ADDED_AT
        ? SortOrder.DESC
        : SortOrder.ASC);
    const direction = resolvedSortOrder === SortOrder.ASC ? 1 : -1;

    return [...items].sort((firstItem, secondItem) => {
      if (resolvedSortBy === WishListSortBy.NAME) {
        return (
          firstItem.productName.localeCompare(secondItem.productName) *
          direction
        );
      }

      if (resolvedSortBy === WishListSortBy.PRICE) {
        return (firstItem.price - secondItem.price) * direction;
      }

      return (
        (firstItem.updatedAt.getTime() - secondItem.updatedAt.getTime()) *
        direction
      );
    });
  }
}
