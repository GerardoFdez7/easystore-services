import { ICartItemBaseType } from '../../../../aggregates/entities/cart/cart.attributes';

export class AddItemToCartDto {
  constructor(
    public readonly data: ICartItemBaseType,
    public readonly customerId: string,
  ) {}
}
