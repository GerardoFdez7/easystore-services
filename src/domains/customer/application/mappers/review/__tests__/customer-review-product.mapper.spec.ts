import { CustomerReviewProduct } from '../../../../aggregates/value-objects';
import { CustomerReviewProductMapper } from '../customer-review-product.mapper';

describe('CustomerReviewProductMapper', () => {
  it('maps only the requested page and preserves pagination metadata', () => {
    const reviews = [
      createReview('00000000-0000-4000-8000-000000000011'),
      createReview('00000000-0000-4000-8000-000000000012'),
      createReview('00000000-0000-4000-8000-000000000013'),
    ];

    const result = CustomerReviewProductMapper.toPaginatedDto(reviews, 2, 2);

    expect(result).toEqual({
      reviews: [CustomerReviewProductMapper.toDto(reviews[2])],
      total: 3,
      hasMore: false,
    });
  });
});

function createReview(id: string): CustomerReviewProduct {
  return CustomerReviewProduct.fromPersistence({
    id,
    ratingCount: 5,
    comment: 'This is a great product.',
    customerId: '00000000-0000-4000-8000-000000000001',
    tenantId: '00000000-0000-4000-8000-000000000003',
    variantId: '00000000-0000-4000-8000-000000000002',
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}
