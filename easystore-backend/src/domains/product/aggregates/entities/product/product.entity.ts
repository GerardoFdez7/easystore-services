import { Entity, EntityProps } from '@domains/entity.base';
import {
  Id,
  Name,
  ShortDescription,
  LongDescription,
  Cover,
  Type,
  Tags,
  Brand,
  Manufacturer,
  Metadata,
} from '../../value-objects/index';
import { IProductType } from './product.attributes';
import { ProductCreatedEvent } from '../../events/product/product-created.event';
import { ProductUpdatedEvent } from '../../events/product/product-updated.event';
import { ProductSoftDeletedEvent } from '../../events/product/product-soft-deleted.event';
import { ProductHardDeletedEvent } from '../../events/product/product-hard-deleted.event';
import { ProductRestoredEvent } from '../../events/product/product-restored.event';

export interface ProductProps extends EntityProps {
  id: Id;
  name: Name;
  shortDescription: ShortDescription;
  longDescription?: LongDescription | null;
  type: Type;
  cover?: Cover | null;
  tags?: Tags[];
  brand?: Brand | null;
  manufacturer?: Manufacturer | null;
  metadata: Metadata;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Entity<ProductProps> {
  constructor(props: ProductProps) {
    super(props);
  }

  /**
   * Factory method to create a new Product
   * @returns The created Product domain entity
   */
  static create(props: IProductType): Product {
    const transformedProps = {
      name: Name.create(props.name),
      shortDescription: ShortDescription.create(props.shortDescription),
      longDescription: props.longDescription
        ? LongDescription.create(props.longDescription)
        : null,
      type: Type.create(props.productType || 'PHYSICAL'),
      cover: props.cover
        ? Cover.create(props.cover)
        : Cover.create('https://easystore.com/default-cover.jpg'),
      tags: (props.tags || []).map((tag) => Tags.create([tag])),
      brand: props.brand ? Brand.create(props.brand) : null,
      manufacturer: props.manufacturer
        ? Manufacturer.create(props.manufacturer)
        : null,
    };

    const product = new Product({
      id: null,
      ...transformedProps,
      metadata: Metadata.create({ deleted: false }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Apply domain event
    product.apply(new ProductCreatedEvent(product));

    return product;
  }

  /**
   * Updates an existing Product with new values
   * @param product The existing Product to update
   * @param updates The properties to update
   * @returns The updated Product domain entity
   */
  static update(product: Product, updates: Partial<IProductType>): Product {
    const props = { ...product.props };

    // Update each property if provided in updates
    if (updates.name !== undefined) {
      props.name = Name.create(updates.name);
    }

    if (
      updates.shortDescription !== undefined &&
      updates.shortDescription !== null
    ) {
      props.shortDescription = ShortDescription.create(
        updates.shortDescription,
      );
    }

    if (
      updates.longDescription !== undefined &&
      updates.longDescription !== null
    ) {
      props.longDescription = updates.longDescription
        ? LongDescription.create(updates.longDescription)
        : null;
    }

    if (updates.productType !== undefined && updates.productType !== null) {
      props.type = Type.create(updates.productType);
    }

    if (updates.cover !== undefined && updates.cover !== null) {
      props.cover = Cover.create(updates.cover);
    }

    if (updates.tags !== undefined && updates.tags !== null) {
      props.tags = updates.tags.map((tag) => Tags.create([tag]));
    }
    if (updates.brand !== undefined && updates.brand !== null) {
      props.brand = updates.brand ? Brand.create(updates.brand) : null;
    }

    if (updates.manufacturer !== undefined && updates.manufacturer !== null) {
      props.manufacturer = updates.manufacturer
        ? Manufacturer.create(updates.manufacturer)
        : null;
    }

    // Update the updatedAt timestamp
    props.updatedAt = new Date();

    const updatedProduct = new Product(props);

    // Apply domain event
    updatedProduct.apply(new ProductUpdatedEvent(updatedProduct));

    return updatedProduct;
  }

  /**
   * Marks a Product as deleted (soft delete)
   * @param product The Product to delete
   * @returns The deleted Product domain entity
   */
  static softDelete(product: Product): Product {
    const props = { ...product.props };

    // Create new metadata with deletion information
    const metadataProps = {
      deleted: true,
      deletedAt: new Date(),
      scheduledForHardDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    props.metadata = Metadata.create(metadataProps);

    // Update the updatedAt timestamp
    props.updatedAt = new Date();

    const deletedProduct = new Product(props);

    // Apply domain event
    deletedProduct.apply(new ProductSoftDeletedEvent(deletedProduct));

    return deletedProduct;
  }

  /**
   * Restores a previously soft-deleted Product
   * @param product The Product to restore
   * @returns The restored Product domain entity
   */
  static restore(product: Product): Product {
    const props = { ...product.props };

    // Create new metadata with deletion flags removed
    props.metadata = Metadata.create({
      deleted: false,
      deletedAt: null,
      scheduledForHardDeleteAt: null,
    });

    // Update the updatedAt timestamp
    props.updatedAt = new Date();

    const restoredProduct = new Product(props);

    // Apply domain event
    restoredProduct.apply(new ProductRestoredEvent(restoredProduct));

    return restoredProduct;
  }

  /**
   * Permanently deletes a Product from the system (hard delete)
   * This should be called by a scheduled job or when a user explicitly empties the trash
   * @param product The Product to permanently delete
   * @returns A flag indicating the product should be removed from the database
   */
  static hardDelete(product: Product): {
    shouldRemove: true;
    product: Product;
  } {
    // Apply domain event before returning
    product.apply(new ProductHardDeletedEvent(product));

    // Return an object with a flag indicating this product should be removed from the database
    return { shouldRemove: true, product };
  }
}
