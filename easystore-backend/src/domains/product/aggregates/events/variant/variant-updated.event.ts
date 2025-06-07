import { Product, Variant } from '../../entities';

export class VariantUpdatedEvent {
  constructor(
    public readonly product: Product,
    public readonly updatedVariant: Variant,
  ) {}
}
