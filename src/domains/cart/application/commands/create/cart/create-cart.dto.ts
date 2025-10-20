import { ICartBaseType } from '../../../../aggregates/entities/cart.attributes';

export class CreateCartDto {
  constructor(public readonly data: ICartBaseType) {}
}
