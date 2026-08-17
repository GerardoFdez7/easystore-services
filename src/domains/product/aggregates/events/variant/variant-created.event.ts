import { IEvent } from '@nestjs/cqrs';
import { Product, Variant } from '../../entities';

export class VariantCreatedEvent implements IEvent {
  constructor(
    public readonly product: Product,
    public readonly craetedVariant: Variant,
  ) {}
}
