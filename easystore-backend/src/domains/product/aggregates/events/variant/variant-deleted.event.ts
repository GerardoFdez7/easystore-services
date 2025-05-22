import { Product, Variant } from '../../entities';

export class VariantDeletedEvent {
  constructor(
    public readonly product: Product,
    public readonly deletedVariant: Variant,
  ) {}
}
