import { Product } from '../entities/product.entity';

export class ProductDeletedEvent {
  constructor(public readonly product: Product) {}
}
