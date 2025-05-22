import { Variant, Warranty } from '../../entities';

export class WarrantyDeletedEvent {
  constructor(
    public readonly variant: Variant,
    public readonly deletedWarranty: Warranty,
  ) {}
}
