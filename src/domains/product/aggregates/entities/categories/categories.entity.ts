import { DomainEntity, DomainEntityProps } from '@shared/domain-entity.base';
import { IProductCategoriesBase } from '../';
import { Id } from '../../value-objects';

export interface IProductCategoriesProps extends DomainEntityProps {
  id: Id;
  productId: Id;
  categoryId: Id;
}

export class ProductCategories extends DomainEntity<IProductCategoriesProps> {
  private constructor(props: IProductCategoriesProps) {
    super(props);
  }

  public static reconstitute(
    props: IProductCategoriesProps,
  ): ProductCategories {
    return new ProductCategories(props);
  }

  public static create(props: IProductCategoriesBase): ProductCategories {
    const productId = Id.create(props.productId);
    const categoryId = Id.create(props.categoryId);

    const productCategories = new ProductCategories({
      id: Id.generate(),
      productId,
      categoryId,
    });

    return productCategories;
  }
}
