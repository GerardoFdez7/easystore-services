import { Product, Variant } from '../../entities';

export class VariantArchivedEvent {
  constructor(
    public readonly product: Product,
    public readonly archivedVariant: Variant,
  ) {}
}
