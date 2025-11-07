import { IWishListCreated } from '../../../../aggregates/entities';

export class CreateWishListDto {
  constructor(
    public readonly wishListItem: IWishListCreated,
    public readonly tenantId: string,
  ) {}
}
