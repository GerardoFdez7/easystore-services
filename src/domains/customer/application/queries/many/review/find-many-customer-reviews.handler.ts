import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Id } from '@shared/value-objects';
import { FindManyCustomerReviewsDto } from './find-many-customer-reviews.dto';
import { ICustomerReviewProductRepository } from '../../../../aggregates/repositories/customer-review-product.interface';
import { IProductAdapter } from '../../../ports';
import { PaginatedCustomerReviewProductWithVariantDTO } from '../../../mappers/review/customer-review-product-enriched.dto';
import { CustomerReviewProductMapper } from '../../../mappers/review/customer-review-product.mapper';
import { enrichWithVariantDetails } from '../../../shared/enrich-with-variant-details';

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
    const tenantId = Id.create(query.tenantId);
    const reviewIds = query.reviewIds?.map((id) => Id.create(id));

    // Get reviews from repository
    const reviews = await this.customerReviewProductRepository.findMany(
      customerId,
      reviewIds,
      tenantId,
    );

    const paginatedReviews = CustomerReviewProductMapper.toPaginatedDto(
      reviews,
      query.page,
      query.limit,
    );
    if (paginatedReviews.total === 0) {
      return { reviews: [], total: 0, hasMore: false };
    }

    // Extract variant IDs from paged reviews to get variant details
    const variantIdStrings = paginatedReviews.reviews.map(
      (review) => review.variantId,
    );

    // Get variant details from product adapter
    const variantDetails =
      await this.productAdapter.getVariantsDetails(variantIdStrings);

    const enrichedReviews = enrichWithVariantDetails(
      paginatedReviews.reviews,
      variantDetails,
    );

    return {
      reviews: enrichedReviews,
      total: paginatedReviews.total,
      hasMore: paginatedReviews.hasMore,
    };
  }
}
