import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Id } from '@shared/value-objects';
import { FindManyCustomerReviewsDto } from './find-many-customer-reviews.dto';
import { ICustomerReviewProductRepository } from '../../../../aggregates/repositories/customer-review-product.interface';
import { IProductAdapter } from '../../../ports';
import {
  PaginatedCustomerReviewProductWithVariantDTO,
  CustomerReviewProductWithVariantDTO,
} from '../../../mappers/review/customer-review-product-enriched.dto';

@QueryHandler(FindManyCustomerReviewsDto)
export class FindManyCustomerReviewsHandler
  implements IQueryHandler<FindManyCustomerReviewsDto>
{
  constructor(
    @Inject('ICustomerReviewProductRepository')
    private readonly customerReviewProductRepository: ICustomerReviewProductRepository,
    @Inject('IProductAdapter')
    private readonly productAdapter: IProductAdapter,
  ) {}

  async execute(
    query: FindManyCustomerReviewsDto,
  ): Promise<PaginatedCustomerReviewProductWithVariantDTO> {
    const customerId = Id.create(query.customerId);
    const reviewIds = query.reviewIds?.map((id) => Id.create(id));

    // Get reviews from repository
    const reviews = await this.customerReviewProductRepository.findMany(
      customerId,
      reviewIds,
    );

    const total = reviews.length;

    if (total === 0) {
      return { reviews: [], total: 0, hasMore: false };
    }

    // Normalize pagination params
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 25));
    const offset = (page - 1) * limit;

    // Slice items for requested page
    const pagedReviews = reviews.slice(offset, offset + limit);

    // Extract variant IDs from paged reviews to get variant details
    const variantIdStrings = pagedReviews.map((review) =>
      review.getVariantIdValue(),
    );

    // Get variant details from product adapter
    const variantDetails =
      await this.productAdapter.getVariantsDetails(variantIdStrings);

    // Create a map for quick lookup of variant details
    const variantDetailsMap = new Map(
      variantDetails.map((variant) => [variant.variantId, variant]),
    );

    // Combine reviews with variant details
    const enrichedReviews: CustomerReviewProductWithVariantDTO[] =
      pagedReviews.map((review) => {
        const variant = variantDetailsMap.get(review.getVariantIdValue());

        return {
          id: review.getIdValue(),
          ratingCount: review.getRatingCount(),
          comment: review.getCommentValue(),
          customerId: review.getCustomerIdValue(),
          variantId: review.getVariantIdValue(),
          updatedAt: review.getUpdatedAt(),
          sku: variant?.sku || '',
          productName: variant?.productName || '',
          firstAttribute: variant?.firstAttribute || { key: '', value: '' },
          price: variant?.price || 0,
          isArchived: variant?.isArchived || false,
        };
      });

    const hasMore = offset + enrichedReviews.length < total;

    return {
      reviews: enrichedReviews,
      total,
      hasMore,
    };
  }
}
