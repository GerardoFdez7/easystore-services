import { Variant, Warranty } from '../../entities';

export class WarrantyUpdatedEvent {
  constructor(
    public readonly variant: Variant,
    public readonly updatedWarranty: Warranty,
  ) {}
}
