import { Product, ProductCategories } from '../../entities';

export class CategoryUnassignedEvent {
  constructor(
    public readonly product: Product,
    public readonly unassignedCategory: ProductCategories,
  ) {}
}
