import { IWishListBase } from '../../../../aggregates/entities';

export class CreateWishListDto {
  constructor(
    public readonly wishListItem: IWishListBase,
    public readonly storeId: string,
  ) {}
}
