import { RemoveManyItemsFromCartData } from '../../../../aggregates/entities/cart.attributes';

export class RemoveManyItemsFromCartDto {
  constructor(
    public readonly data: RemoveManyItemsFromCartData,
    public readonly customerId: string,
  ) {}
}
