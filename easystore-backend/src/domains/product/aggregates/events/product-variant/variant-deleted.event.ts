import { Product } from '../../entities/product.entity';
import { Variant } from '../../value-objects/variant.value-object';

export class VariantDeletedEvent {
  constructor(
    public readonly product: Product,
    public readonly deletedVariant: Variant,
  ) {}
}
