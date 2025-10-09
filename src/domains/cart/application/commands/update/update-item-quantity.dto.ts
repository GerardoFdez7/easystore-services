import { IUpdateItemQuantityData } from 'src/domains/cart/aggregates/entities/cart.attributes';

export class UpdateItemQuantityDto {
  constructor(
    public readonly data: IUpdateItemQuantityData,
    public readonly customerId: string,
  ) {}
}
