import { Test, TestingModule } from '@nestjs/testing';
import { FindWishListItemsHandler } from '../find-wish-list-items.handler';
import { FindWishlistItemsDto } from '../find-wish-list-items.dto';
import { IWishListRepository } from '../../../../../aggregates/repositories/wish-list.interface';
import { IProductAdapter } from '../../../../ports';
import { WishListItem } from '../../../../../aggregates/value-objects';
import { PaginatedWishlistDTO } from '../../../../mappers/wish-list/wish-list.dto';
import { SortOrder } from '@shared/value-objects';
import { WishListSortBy } from '../find-wish-list-items.dto';

describe('FindWishListItemsHandler', () => {
  const customerId = '11111111-1111-4111-8111-111111111111';
  const variantId = '22222222-2222-4222-8222-222222222222';
  let handler: FindWishListItemsHandler;
  let wishListRepository: jest.Mocked<IWishListRepository>;
  let productAdapter: jest.Mocked<IProductAdapter>;
  let findManyMock: jest.MockedFunction<IWishListRepository['findMany']>;
  let getVariantsDetailsMock: jest.MockedFunction<
    IProductAdapter['getVariantsDetails']
  >;

  beforeEach(async () => {
    findManyMock = jest.fn<
      ReturnType<IWishListRepository['findMany']>,
      Parameters<IWishListRepository['findMany']>
    >();
    getVariantsDetailsMock = jest.fn<
      ReturnType<IProductAdapter['getVariantsDetails']>,
      Parameters<IProductAdapter['getVariantsDetails']>
    >();
    wishListRepository = {
      create: jest.fn(),
      findWishListItemByVariantId: jest.fn(),
      removeVariantFromWishList: jest.fn(),
      removeManyFromWishList: jest.fn(),
      findMany: findManyMock,
    };
    productAdapter = {
      getVariantsDetails: getVariantsDetailsMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindWishListItemsHandler,
        { provide: 'IWishListRepository', useValue: wishListRepository },
        { provide: 'IProductAdapter', useValue: productAdapter },
      ],
    }).compile();

    handler = module.get<FindWishListItemsHandler>(FindWishListItemsHandler);
  });

  it('retrieves the authenticated customer wishlist without a variant filter', async () => {
    const wishlistItem = WishListItem.fromPersistence({
      id: '33333333-3333-4333-8333-333333333333',
      customerId,
      variantId,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    findManyMock.mockResolvedValue([wishlistItem]);
    getVariantsDetailsMock.mockResolvedValue([
      {
        variantId,
        sku: 'SKU-1',
        productName: 'Product 1',
        firstAttribute: { key: 'Color', value: 'Blue' },
        price: 12.5,
        isArchived: false,
      },
    ]);

    const result: PaginatedWishlistDTO = await handler.execute(
      new FindWishlistItemsDto(customerId, 1, 10),
    );

    const customerArgument = findManyMock.mock.calls[0]?.[0];

    expect(customerArgument?.getValue()).toBe(customerId);
    expect(getVariantsDetailsMock).toHaveBeenCalledWith([variantId]);
    expect(result).toEqual({
      wishlistItems: [
        expect.objectContaining({
          id: '33333333-3333-4333-8333-333333333333',
          variantId,
        }),
      ],
      total: 1,
      hasMore: false,
    });
  });

  it('does not request product details for an empty wishlist', async () => {
    findManyMock.mockResolvedValue([]);

    await expect(
      handler.execute(new FindWishlistItemsDto(customerId)),
    ).resolves.toEqual({ wishlistItems: [], total: 0, hasMore: false });

    expect(getVariantsDetailsMock).not.toHaveBeenCalled();
  });

  it('sorts the full wishlist by name, price, or added date before paginating', async () => {
    const variantIds = [
      '22222222-2222-4222-8222-222222222221',
      '22222222-2222-4222-8222-222222222222',
      '22222222-2222-4222-8222-222222222223',
    ];
    findManyMock.mockResolvedValue([
      WishListItem.fromPersistence({
        id: '33333333-3333-4333-8333-333333333331',
        customerId,
        variantId: variantIds[0],
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
      WishListItem.fromPersistence({
        id: '33333333-3333-4333-8333-333333333332',
        customerId,
        variantId: variantIds[1],
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
      WishListItem.fromPersistence({
        id: '33333333-3333-4333-8333-333333333333',
        customerId,
        variantId: variantIds[2],
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      }),
    ]);
    getVariantsDetailsMock.mockResolvedValue([
      {
        variantId: variantIds[0],
        sku: 'SKU-Z',
        productName: 'Zebra',
        firstAttribute: { key: 'Color', value: 'Blue' },
        price: 20,
        isArchived: false,
      },
      {
        variantId: variantIds[1],
        sku: 'SKU-A',
        productName: 'Apple',
        firstAttribute: { key: 'Color', value: 'Red' },
        price: 30,
        isArchived: false,
      },
      {
        variantId: variantIds[2],
        sku: 'SKU-B',
        productName: 'Banana',
        firstAttribute: { key: 'Color', value: 'Yellow' },
        price: 10,
        isArchived: false,
      },
    ]);

    const byName = await handler.execute(
      new FindWishlistItemsDto(
        customerId,
        1,
        3,
        WishListSortBy.NAME,
        SortOrder.ASC,
      ),
    );
    const byPrice = await handler.execute(
      new FindWishlistItemsDto(
        customerId,
        1,
        3,
        WishListSortBy.PRICE,
        SortOrder.DESC,
      ),
    );
    const byAddedAt = await handler.execute(
      new FindWishlistItemsDto(
        customerId,
        1,
        1,
        WishListSortBy.ADDED_AT,
        SortOrder.ASC,
      ),
    );

    expect(byName.wishlistItems.map((item) => item.productName)).toEqual([
      'Apple',
      'Banana',
      'Zebra',
    ]);
    expect(byPrice.wishlistItems.map((item) => item.price)).toEqual([
      30, 20, 10,
    ]);
    expect(byAddedAt.wishlistItems[0]?.variantId).toBe(variantIds[1]);
    expect(byAddedAt.hasMore).toBe(true);
  });
});
