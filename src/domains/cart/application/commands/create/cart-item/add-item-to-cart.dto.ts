import { ICartItemBaseType } from 'src/domains/cart/aggregates/entities/cart.attributes';

export class AddItemToCartDto {
  constructor(
    public readonly data: ICartItemBaseType,
    public readonly customerId: string,
  ) {}
}
