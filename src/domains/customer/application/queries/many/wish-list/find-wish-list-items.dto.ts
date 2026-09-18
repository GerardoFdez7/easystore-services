import { SortOrder } from '@shared/aggregates/value-objects';

export enum WishListSortBy {
  ADDED_AT = 'addedAt',
  NAME = 'name',
  PRICE = 'price',
}

export class FindWishlistItemsDto {
  constructor(
    public readonly customerId: string,
    public readonly storeId: string,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly sortBy?: WishListSortBy,
    public readonly sortOrder?: SortOrder,
  ) {}
}
