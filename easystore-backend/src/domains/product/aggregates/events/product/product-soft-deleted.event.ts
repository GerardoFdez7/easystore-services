import { Product } from '../../entities/product.entity';

export class ProductSoftDeletedEvent {
  constructor(public readonly product: Product) {}
}
