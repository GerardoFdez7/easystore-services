import { ProductData } from '@domain/events/product-updated.event';

export class ProductUpdatedEvent {
  constructor(
    public readonly productId: string,
    public readonly clientId: number,
    public readonly categoryId: string,
    public readonly product: ProductData,
  ) {}
}
