import { Product, Sustainability } from '../../entities';

export class SustainabilityDeletedEvent {
  constructor(
    public readonly product: Product,
    public readonly deletedSustainability: Sustainability,
  ) {}
}
