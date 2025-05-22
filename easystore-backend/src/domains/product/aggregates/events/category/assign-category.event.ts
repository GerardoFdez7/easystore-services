import { Product, ProductCategories } from '../../entities';

export class CategoryAssignedEvent {
  constructor(
    public readonly product: Product,
    public readonly assignedCategory: ProductCategories,
  ) {}
}
