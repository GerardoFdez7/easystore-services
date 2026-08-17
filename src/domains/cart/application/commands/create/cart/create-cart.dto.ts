import { ICartBaseType } from '../../../../aggregates/entities/cart/cart.attributes';

export class CreateCartDto {
  constructor(public readonly data: ICartBaseType) {}
}
