import { Product, Sustainability } from '../../entities';

export class SustainabilityCreatedEvent {
  constructor(
    public readonly product: Product,
    public readonly sustainabilityCreated: Sustainability,
  ) {}
}
