import { BadRequestException, NotFoundException } from '@nestjs/common';
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
} from '../../value-objects';
import {
  IProductBase,
  Variant,
  IVariantBase,
  ProductCategories,
  Media,
  Sustainability,
  Entity,
  EntityProps,
} from '../';
import {
  ProductCreatedEvent,
  ProductUpdatedEvent,
  ProductSoftDeletedEvent,
  ProductHardDeletedEvent,
  ProductRestoredEvent,
  VariantCreatedEvent,
  VariantUpdatedEvent,
  VariantArchivedEvent,
  VariantRestoredEvent,
  VariantDeletedEvent,
} from '../../events';

export interface IProductProps extends EntityProps {
  id: Id;
  name: Name;
  shortDescription: ShortDescription;
  longDescription?: LongDescription | null;
  productType: Type;
  cover?: Cover | null;
  tags?: Tags[];
  brand?: Brand | null;
  manufacturer?: Manufacturer | null;
  isArchived: boolean;
  tenantId: Id;
  updatedAt: Date;
  createdAt: Date;
  variants: Variant[];
  categories: ProductCategories[];
  media: Media[];
  sustainabilities: Sustainability[];
}

export class Product extends Entity<IProductProps> {
  constructor(props: IProductProps) {
    super(props);
  }

  /**
   * Factory method to create a new Product
   * @returns The created Product domain entity
   */
  static create(props: IProductBase): Product {
    const transformedProps = {
      name: Name.create(props.name),
      shortDescription: ShortDescription.create(props.shortDescription),
      longDescription: props.longDescription
        ? LongDescription.create(props.longDescription)
        : null,
      productType: Type.create(props.productType || 'PHYSICAL'),
      cover: props.cover
        ? Cover.create(props.cover)
        : Cover.create('https://easystore.com/default-cover.jpg'),
      tags: (props.tags || []).map((tag) => Tags.create([tag])),
      brand: props.brand ? Brand.create(props.brand) : null,
      manufacturer: props.manufacturer
        ? Manufacturer.create(props.manufacturer)
        : null,
      tenantId: Id.create(props.tenantId),
    };
    // Creation of related entities
    // This ID represents the product being created.
    const newProductIdValue = null;
    const newProductEntityId = Id.create(newProductIdValue as number);
    const productTenantId = transformedProps.tenantId;

    const variants = (props.variants || []).map((variantData) =>
      Variant.create({
        ...variantData,
        productId: newProductEntityId.getValue(),
        tenantId: productTenantId.getValue(),
      }),
    );

    const media = (props.media || []).map((mediaData) =>
      Media.create({
        ...mediaData,
        productId: newProductEntityId.getValue(),
      }),
    );

    const categories = (props.categories || []).map((categoryData) =>
      ProductCategories.create({
        ...categoryData,
        productId: newProductEntityId.getValue(),
      }),
    );

    const sustainabilities = (props.sustainabilities || []).map(
      (sustainabilityData) =>
        Sustainability.create({
          ...sustainabilityData,
          productId: newProductEntityId.getValue(),
        }),
    );

    const product = new Product({
      id: null,
      ...transformedProps,
      variants,
      media,
      categories,
      sustainabilities,
      isArchived: false,
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
  static update(
    product: Product,
    updates: Partial<Omit<IProductBase, 'tenantId'>>,
  ): Product {
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
      props.productType = Type.create(updates.productType);
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

    if (updates.media !== undefined && updates.media !== null) {
      props.media = updates.media.map((mediaData) =>
        Media.create({
          ...mediaData,
          productId: product.props.id.getValue(),
        }),
      );
    }

    if (updates.categories !== undefined && updates.categories !== null) {
      props.categories = updates.categories.map((categoryData) =>
        ProductCategories.create({
          ...categoryData,
          productId: product.props.id.getValue(),
        }),
      );
    }

    if (
      updates.sustainabilities !== undefined &&
      updates.sustainabilities !== null
    ) {
      props.sustainabilities = updates.sustainabilities.map(
        (sustainabilityData) =>
          Sustainability.create({
            ...sustainabilityData,
            productId: product.props.id.getValue(),
          }),
      );
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

    // Change isArchived to true
    props.isArchived = true;

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

    // Change isArchived to false
    props.isArchived = false;

    // Update the updatedAt timestamp
    props.updatedAt = new Date();

    const restoredProduct = new Product(props);

    // Apply domain event
    restoredProduct.apply(new ProductRestoredEvent(restoredProduct));

    return restoredProduct;
  }

  /**
   * Permanently deletes a Product from the system (hard delete)
   * @param product The Product to permanently delete
   * @returns Deleted product
   */
  static hardDelete(product: Product): Product {
    // Apply domain event before returning
    product.apply(new ProductHardDeletedEvent(product));

    return product;
  }

  // --- Variant Management ---

  /**
   * Adds a new variant to the product.
   * @param variantData The data for the new variant, conforming to IVariantBase.
   */
  public addVariant(variantData: IVariantBase): void {
    const newVariant = Variant.create({
      ...variantData,
      productId: this.props.id.getValue(),
      tenantId: this.props.tenantId.getValue(),
    });
    this.props.variants.push(newVariant);
    this.props.updatedAt = new Date();

    this.apply(new VariantCreatedEvent(this, newVariant));
  }

  /**
   * Updates an existing variant of the product.
   * @param variantId The ID of the variant to update.
   * @param updateData The data to update the variant with, conforming to Partial<IVariantBase>.
   */
  public updateVariant(
    variantId: number,
    updateData: Partial<IVariantBase>,
  ): void {
    const variant = this.props.variants.find(
      (v) => v.get('id').getValue() === variantId,
    );
    if (!variant) {
      throw new NotFoundException(
        `Variant with ID ${variantId} not found on product ${this.props.id.getValue()}.`,
      );
    }
    variant.update(updateData);
    this.props.updatedAt = new Date();

    this.apply(new VariantUpdatedEvent(this, variant));
  }

  /**
   * Soft deletes a variant from the product.
   * @param variantId The ID of the variant to soft delete.
   */
  public archiveVariant(variantId: number): void {
    const variant = this.props.variants.find(
      (v) => v.get('id').getValue() === variantId,
    );
    if (!variant) {
      throw new NotFoundException(
        `Variant with ID ${variantId} not found on product ${this.props.id.getValue()}.`,
      );
    }

    // Check if the product is already archived
    const isArchived = variant.get('isArchived');
    if (isArchived === true) {
      throw new BadRequestException(
        `Variant with ID ${variantId} is already archived and cannot be archived again`,
      );
    }

    variant.archive();

    this.apply(new VariantArchivedEvent(this, variant));
  }

  /**
   * Restores a previously soft-deleted variant.
   * @param variantId The ID of the variant to restore.
   */
  public restoreVariant(variantId: number): void {
    const variant = this.props.variants.find(
      (v) => v.get('id').getValue() === variantId,
    );
    if (!variant) {
      throw new NotFoundException(
        `Variant with ID ${variantId} not found on product ${this.props.id.getValue()}.`,
      );
    }

    // Check if the variant is actually deleted
    const isArchived = variant.get('isArchived');
    if (isArchived === false) {
      throw new BadRequestException(
        `Variant with ID ${variantId} is not in a deleted state and cannot be restored`,
      );
    }

    variant.restore();

    this.apply(new VariantRestoredEvent(this, variant));
  }

  /**
   * Removes a variant from the product.
   * @param variantId The ID of the variant to remove.
   */
  public removeVariant(variantId: number): void {
    const variantIndex = this.props.variants.findIndex(
      (v) => v.get('id').getValue() === variantId,
    );
    if (variantIndex === -1) {
      throw new NotFoundException(
        `Variant with ID ${variantId} not found on product ${this.props.id.getValue()}.`,
      );
    }
    const removedVariant = this.props.variants.splice(variantIndex, 1)[0];
    this.props.updatedAt = new Date();

    this.apply(new VariantDeletedEvent(this, removedVariant));
  }
}
