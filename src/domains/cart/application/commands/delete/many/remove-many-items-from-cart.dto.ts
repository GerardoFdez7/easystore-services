import { RemoveManyItemsFromCartData } from '../../../../aggregates/entities/cart/cart.attributes';

export class RemoveManyItemsFromCartDto {
  constructor(
    public readonly data: RemoveManyItemsFromCartData,
    public readonly customerId: string,
    public readonly tenantId: string,
  ) {}
}
