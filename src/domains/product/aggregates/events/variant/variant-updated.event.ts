import { IEvent } from '@nestjs/cqrs';
import { Product, Variant } from '../../entities';

export class VariantUpdatedEvent implements IEvent {
  constructor(
    public readonly product: Product,
    public readonly updatedVariant: Variant,
  ) {}
}
