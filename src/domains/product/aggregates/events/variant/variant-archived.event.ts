import { IEvent } from '@nestjs/cqrs';
import { Product, Variant } from '../../entities';

export class VariantArchivedEvent implements IEvent {
  constructor(
    public readonly product: Product,
    public readonly archivedVariant: Variant,
  ) {}
}
