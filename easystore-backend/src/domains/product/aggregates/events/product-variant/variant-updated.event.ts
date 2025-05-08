import { Product } from '../../entities/product.entity';
import { Variant } from '../../value-objects/variant.value-object';

export class VariantUpdatedEvent {
  constructor(
    public readonly product: Product,
    public readonly updatedVariant: Variant,
  ) {}
}
