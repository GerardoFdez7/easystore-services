import { Product, Variant } from '../../entities';

export class VariantRestoredEvent {
  constructor(
    public readonly product: Product,
    public readonly restoredVariant: Variant,
  ) {}
}
