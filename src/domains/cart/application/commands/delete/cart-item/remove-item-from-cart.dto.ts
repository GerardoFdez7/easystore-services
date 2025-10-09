import { IRemoveItemFromCartData } from 'src/domains/cart/aggregates/entities/cart.attributes';

export class RemoveItemFromCartDto {
  constructor(public readonly data: IRemoveItemFromCartData) {}
}
