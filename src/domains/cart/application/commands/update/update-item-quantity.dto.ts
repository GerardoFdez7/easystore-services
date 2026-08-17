import { IUpdateItemQuantityData } from '../../../aggregates/entities/cart/cart.attributes';

export class UpdateItemQuantityDto {
  constructor(
    public readonly data: IUpdateItemQuantityData,
    public readonly customerId: string,
  ) {}
}
