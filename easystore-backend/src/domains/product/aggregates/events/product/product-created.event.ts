import { Product } from '../../entities/product.entity';

export class ProductCreatedEvent {
  constructor(public readonly product: Product) {}
}
