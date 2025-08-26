import { Entity, EntityProps, IProductCategoriesBase } from '../';
import { Id } from '../../value-objects';

export interface IProductCategoriesProps extends EntityProps {
  id: Id;
  productId: Id;
  categoryId: Id;
  category?: { name: string } | null;
}

export class ProductCategories extends Entity<IProductCategoriesProps> {
  constructor(props: IProductCategoriesProps) {
    super(props);
  }

  public static create(props: IProductCategoriesBase): ProductCategories {
    const productId = Id.create(props.productId);
    const categoryId = Id.create(props.categoryId);

    const productCategories = new ProductCategories({
      id: Id.generate(),
      productId,
      categoryId,
      categoryName: props.category.name,
    });

    return productCategories;
  }
}
