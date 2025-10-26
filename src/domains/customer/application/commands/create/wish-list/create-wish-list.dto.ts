import { IWishListCreated } from 'src/domains/customer/aggregates/entities';

export class CreateWishListDto {
  constructor(
    public readonly wishListItem: IWishListCreated,
    public readonly tenantId: string,
  ) {}
}
