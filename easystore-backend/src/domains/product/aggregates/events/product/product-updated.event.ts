import { Product } from '../../entities/product.entity';

export class ProductUpdatedEvent {
  constructor(public readonly product: Product) {}
}
