import { Variant, Warranty } from '../../entities';

export class WarrantyCreatedEvent {
  constructor(
    public readonly variant: Variant,
    public readonly warrantyCreated: Warranty,
  ) {}
}
