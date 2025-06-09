import { Product, Variant } from '../../entities';

export class VariantCreatedEvent {
  constructor(
    public readonly product: Product,
    public readonly craetedVariant: Variant,
  ) {}
}
