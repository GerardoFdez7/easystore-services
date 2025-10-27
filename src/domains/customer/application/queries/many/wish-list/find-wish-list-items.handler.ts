import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Id } from '@shared/value-objects';
import { FindWishlistItemsDto } from './find-wish-list-items.dto';
import { IWishListRepository } from '../../../../aggregates/repositories/wish-list.interface';
import { IProductAdapter } from '../../../ports';
import { WishlistItemWithVariantDTO } from '../../../mappers/wish-list/wish-list.dto';

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

  async execute(
    query: FindWishlistItemsDto,
  ): Promise<WishlistItemWithVariantDTO[]> {
    const customerId = Id.create(query.customerId);
    const variantIds = query.variantsIds.map((id) => Id.create(id));

    // Get wishlist items from repository
    const wishListItems =
      await this.wishListRepository.getManyWishListsByVariantIds(
        variantIds,
        customerId,
      );

    if (wishListItems.length === 0) {
      return [];
    }

    // Extract variant IDs from wishlist items to get variant details
    const variantIdStrings = wishListItems.map((item) =>
      item.getVariantIdValue(),
    );

    // Get variant details from product adapter
    const variantDetails =
      await this.productAdapter.getVariantsDetails(variantIdStrings);

    // Create a map for quick lookup of variant details
    const variantDetailsMap = new Map(
      variantDetails.map((variant) => [variant.variantId, variant]),
    );

    // Combine wishlist items with variant details
    const enrichedWishlistItems: WishlistItemWithVariantDTO[] =
      wishListItems.map((item) => {
        const variant = variantDetailsMap.get(item.getVariantIdValue());

        return {
          id: item.getIdValue(),
          variantId: item.getVariantIdValue(),
          customerId: item.getCustomerIdValue(),
          updatedAt: item.getUpdatedAt(),
          // Variant details - provide defaults if variant not found
          sku: variant?.sku || '',
          productName: variant?.productName || '',
          firstAttribute: variant?.firstAttribute || { key: '', value: '' },
          price: variant?.price || 0,
          isArchived: variant?.isArchived || false,
        };
      });

    return enrichedWishlistItems;
  }
}
