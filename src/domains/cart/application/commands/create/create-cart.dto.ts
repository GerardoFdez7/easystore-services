import { ICartBaseType } from 'src/domains/cart/aggregates/entities/cart.attributes';

export class CreateCartDto {
  constructor(public readonly data: ICartBaseType) {}
}
