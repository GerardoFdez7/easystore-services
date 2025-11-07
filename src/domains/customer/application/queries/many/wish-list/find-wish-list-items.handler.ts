import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Id } from '@shared/value-objects';
import { FindWishlistItemsDto } from './find-wish-list-items.dto';
import { IWishListRepository } from '../../../../aggregates/repositories/wish-list.interface';
import { IProductAdapter } from '../../../ports';
import {
  PaginatedWishlistDTO,
  WishlistItemWithVariantDTO,
} from '../../../mappers/wish-list/wish-list.dto';

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
    const variantIds = Array.isArray(query.variantsIds)
      ? query.variantsIds.map((id) => Id.create(id))
      : [];

    // Get wishlist items from repository
    const wishListItems =
      await this.wishListRepository.getManyWishListsByVariantIds(
        variantIds,
        customerId,
      );

    const total = wishListItems.length;

    if (total === 0) {
      return { wishlistItems: [], total: 0, hasMore: false };
    }

    // Normalize pagination params
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 25));
    const offset = (page - 1) * limit;

    // Slice items for requested page
    const pagedItems = wishListItems.slice(offset, offset + limit);

    // Extract variant IDs from paged wishlist items to get variant details
    const variantIdStrings = pagedItems.map((item) => item.getVariantIdValue());

    // Get variant details from product adapter
    const variantDetails =
      await this.productAdapter.getVariantsDetails(variantIdStrings);

    // Create a map for quick lookup of variant details
    const variantDetailsMap = new Map(
      variantDetails.map((variant) => [variant.variantId, variant]),
    );

    // Combine wishlist items with variant details
    const enrichedWishlistItems: WishlistItemWithVariantDTO[] = pagedItems.map(
      (item) => {
        const variant = variantDetailsMap.get(item.getVariantIdValue());

        return {
          id: item.getIdValue(),
          variantId: item.getVariantIdValue(),
          customerId: item.getCustomerIdValue(),
          updatedAt: item.getUpdatedAt(),
          sku: variant?.sku || '',
          productName: variant?.productName || '',
          firstAttribute: variant?.firstAttribute || { key: '', value: '' },
          price: variant?.price || 0,
          isArchived: variant?.isArchived || false,
        };
      },
    );

    const hasMore = offset + enrichedWishlistItems.length < total;

    return { wishlistItems: enrichedWishlistItems, total, hasMore };
  }
}
