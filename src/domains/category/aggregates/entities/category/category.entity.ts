import { Entity, EntityProps, ICategoryBase } from '../';
import { Id, Name, ShortDescription } from '../../value-objects';
import {
  CategoryCreatedEvent,
  CategoryDeletedEvent,
  CategoryUpdatedEvent,
} from '../../events';

export interface ICategoryProps extends EntityProps {
  id: Id;
  name: Name;
  description: ShortDescription;
  subCategories?: ICategoryProps[];
  parentId?: Id;
  tenantId: Id;
  updatedAt: Date;
  createdAt: Date;
}

export class Category extends Entity<ICategoryProps> {
  private constructor(props: ICategoryProps) {
    super(props);
  }

  /**
   * Factory method to reconstitute a Category from persistence or other sources.
   * Assumes all props, including ID and child entities, are already in domain format.
   * @param props The complete properties of the category.
   * @returns The reconstituted Category domain entity.
   */
  static reconstitute(props: ICategoryProps): Category {
    const category = new Category(props);
    return category;
  }

  /**
   * Factory method to create a new Category
   * @returns The created Category domain entity
   */
  static create(props: ICategoryBase): Category {
    const transformedProps = {
      name: Name.create(props.name),
      description: props.description
        ? ShortDescription.create(props.description)
        : null,
      subCategories: (props.subCategories || []).map((subCategory) => {
        const subCategoryEntity = Category.create(subCategory);
        return subCategoryEntity.props;
      }),
      parentId: props.parentId ? Id.create(props.parentId) : null,
      tenantId: Id.create(props.tenantId),
    };

    const category = new Category({
      id: Id.generate(),
      ...transformedProps,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    // Apply domain event
    category.apply(new CategoryCreatedEvent(category));

    return category;
  }

  /**
   * Factory method to update a new Category
   * @param category The category to update
   * @param updates The properties to update
   * @returns The created Category domain entity
   */
  static update(
    category: Category,
    updates: Partial<Omit<ICategoryBase, 'tenantId'>>,
  ): Category {
    const props = { ...category.props };

    if (updates.name !== undefined) {
      props.name = Name.create(updates.name);
    }
    if (updates.description !== undefined) {
      props.description = ShortDescription.create(updates.description);
    }

    if (updates.subCategories !== undefined) {
      props.subCategories = (updates.subCategories || []).map((subCategory) => {
        const subCategoryEntity = Category.create(subCategory);
        return subCategoryEntity.props;
      });
    }

    if (updates.parentId !== undefined) {
      props.parentId = Id.create(updates.parentId);
    }

    // Update the updatedAt timestamp
    props.updatedAt = new Date();

    const updatedCategory = new Category(props);

    // Apply domain event
    updatedCategory.apply(new CategoryUpdatedEvent(updatedCategory));

    return updatedCategory;
  }

  /**
   * Factory method to delete a new Category
   * @param category The category to delete
   * @returns The deleted
   */
  static delete(category: Category): Category {
    // Apply domain event
    category.apply(new CategoryDeletedEvent(category));

    return category;
  }
}
