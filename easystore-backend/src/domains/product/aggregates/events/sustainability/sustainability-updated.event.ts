import { Product, Sustainability } from '../../entities';

export class SustainabilityUpdatedEvent {
  constructor(
    public readonly product: Product,
    public readonly updatedSustainability: Sustainability,
  ) {}
}
