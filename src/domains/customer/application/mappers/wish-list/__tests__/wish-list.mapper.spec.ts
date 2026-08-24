import { WishListItem } from '../../../../aggregates/value-objects';
import { WishListMapper } from '../wish-list.mapper';

describe('WishListMapper', () => {
  it('maps only the requested page and reports when more items remain', () => {
    const items = [
      createWishListItem('00000000-0000-4000-8000-000000000011'),
      createWishListItem('00000000-0000-4000-8000-000000000012'),
      createWishListItem('00000000-0000-4000-8000-000000000013'),
    ];

    const result = WishListMapper.toPaginatedDto(items, 1, 2);

    expect(result).toEqual({
      wishlistItems: items
        .slice(0, 2)
        .map((item) => WishListMapper.toDto(item)),
      total: 3,
      hasMore: true,
    });
  });
});

function createWishListItem(id: string): WishListItem {
  return WishListItem.fromPersistence({
    id,
    customerId: '00000000-0000-4000-8000-000000000001',
    variantId: '00000000-0000-4000-8000-000000000002',
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}
