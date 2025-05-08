import { Product } from '../../entities/product.entity';

export class VariantCreatedEvent {
  constructor(public readonly product: Product) {}
}
