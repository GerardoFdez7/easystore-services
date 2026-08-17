import { IEvent } from '@nestjs/cqrs';
import { Product, Variant } from '../../entities';

export class VariantRestoredEvent implements IEvent {
  constructor(
    public readonly product: Product,
    public readonly restoredVariant: Variant,
  ) {}
}
