import { IRemoveItemFromCartData } from '../../../../aggregates/entities/cart.attributes';

export class RemoveItemFromCartDto {
  constructor(
    public readonly data: IRemoveItemFromCartData,
    public readonly customerId: string,
  ) {}
}
