import { Entity, EntityProps } from '../../entity.base';
import { Id } from '../../value-objects';
import { IProductCategoriesBase } from '../';

export interface IProductCategoriesProps extends EntityProps {
  id: Id;
  productId: Id;
  categoryId: Id;
}

export class ProductCategories extends Entity<IProductCategoriesProps> {
  constructor(props: IProductCategoriesProps) {
    super(props);
  }

  public static create(props: IProductCategoriesBase): ProductCategories {
    const productId = Id.create(props.productId);
    const categoryId = Id.create(props.categoryId);

    const productCategories = new ProductCategories({
      id: null,
      productId,
      categoryId,
    });

    return productCategories;
  }

  public update(data: Partial<{ categoryId: number }>): void {
    if (data.categoryId !== undefined) {
      this.props.categoryId = Id.create(data.categoryId);
    }
    this.props.updatedAt = new Date();
  }
}
