import { IEvent } from '@nestjs/cqrs';
import { Product, Variant } from '../../entities';

export class VariantDeletedEvent implements IEvent {
  constructor(
    public readonly product: Product,
    public readonly deletedVariant: Variant,
  ) {}
}
