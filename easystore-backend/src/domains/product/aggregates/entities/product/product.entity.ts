import { NotFoundException } from '@nestjs/common';
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
} from '../../value-objects';
import {
  IProductBase,
  Variant,
  IVariantBase,
  ProductCategories,
  IProductCategoriesBase,
  Media,
  IMediaBase,
  Sustainability,
  ISustainabilityBase,
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
  VariantDeletedEvent,
  MediaCreatedEvent,
  MediaUpdatedEvent,
  MediaDeletedEvent,
  SustainabilityCreatedEvent,
  SustainabilityUpdatedEvent,
  SustainabilityDeletedEvent,
  CategoryAssignedEvent,
  CategoryUnassignedEvent,
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
  metadata: Metadata;
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
      id: newProductEntityId,
      ...transformedProps,
      variants,
      media,
      categories,
      sustainabilities,
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

  // --- Media Management ---

  /**
   * Adds a new media item to the product.
   * @param mediaData The data for the new media item, conforming to IMediaBase.
   */
  public addMedia(mediaData: IMediaBase): void {
    const newMedia = Media.create({
      ...mediaData,
      productId: this.props.id.getValue(),
    });
    this.props.media.push(newMedia);
    this.props.updatedAt = new Date();

    this.apply(new MediaCreatedEvent(this, newMedia));
  }

  /**
   * Updates an existing media item of the product.
   * @param mediaId The ID of the media item to update.
   * @param updateData The data to update the media item with, conforming to Partial<IMediaBase>.
   */
  public updateMedia(mediaId: number, updateData: Partial<IMediaBase>): void {
    const media = this.props.media.find(
      (m) => m.get('id').getValue() === mediaId,
    );
    if (!media) {
      throw new NotFoundException(
        `Media with ID ${mediaId} not found on product ${this.props.id.getValue()}.`,
      );
    }
    media.update(updateData);
    this.props.updatedAt = new Date();

    this.apply(new MediaUpdatedEvent(this, media));
  }

  /**
   * Removes a media item from the product.
   * @param mediaId The ID of the media item to remove.
   */
  public removeMedia(mediaId: number): void {
    const mediaIndex = this.props.media.findIndex(
      (m) => m.get('id').getValue() === mediaId,
    );
    if (mediaIndex === -1) {
      throw new NotFoundException(
        `Media with ID ${mediaId} not found on product ${this.props.id.getValue()}.`,
      );
    }
    const removedMedia = this.props.media.splice(mediaIndex, 1)[0];
    this.props.updatedAt = new Date();

    this.apply(new MediaDeletedEvent(this, removedMedia));
  }

  // -- Sustainability Management ---

  /**
   * Adds a new sustainability to the product.
   * @param sustainabilityData The data for the new sustainability, conforming to ISustainabilityBase.
   */
  public addSustainability(sustainabilityData: ISustainabilityBase): void {
    const newSustainability = Sustainability.create({
      ...sustainabilityData,
      productId: this.props.id.getValue(),
    });
    this.props.sustainabilities.push(newSustainability);
    this.props.updatedAt = new Date();

    this.apply(new SustainabilityCreatedEvent(this, newSustainability));
  }

  /**
   * Updates an existing sustainability of the product.
   * @param sustainabilityId The ID of the sustainability to update.
   * @param updateData The data to update the sustainability with, conforming to Partial<ISustainabilityBase>.
   */
  public updateSustainability(
    sustainabilityId: number,
    updateData: Partial<ISustainabilityBase>,
  ): void {
    const sustainability = this.props.sustainabilities.find(
      (s) => s.get('id').getValue() === sustainabilityId,
    );
    if (!sustainability) {
      throw new NotFoundException(
        `Sustainability with ID ${sustainabilityId} not found on product ${this.props.id.getValue()}.`,
      );
    }
    sustainability.update(updateData);
    this.props.updatedAt = new Date();

    this.apply(new SustainabilityUpdatedEvent(this, sustainability));
  }

  /**
   * Removes a sustainability from the product.
   * @param sustainabilityId The ID of the sustainability to remove.
   */
  public removeSustainability(sustainabilityId: number): void {
    const sustainabilityIndex = this.props.sustainabilities.findIndex(
      (s) => s.get('id').getValue() === sustainabilityId,
    );
    if (sustainabilityIndex === -1) {
      throw new NotFoundException(
        `Sustainability with ID ${sustainabilityId} not found on product ${this.props.id.getValue()}.`,
      );
    }
    const removedSustainability = this.props.sustainabilities.splice(
      sustainabilityIndex,
      1,
    )[0];
    this.props.updatedAt = new Date();

    this.apply(new SustainabilityDeletedEvent(this, removedSustainability));
  }

  // --- Category Management ---
  /**
   * Assigns a category to the product.
   * @param categoryId The ID of the category to assign.
   */
  public assignCategory(categoryId: number): void {
    const productCategoryData: IProductCategoriesBase = {
      productId: this.props.id.getValue(),
      categoryId: categoryId,
    };

    const newProductCategory = ProductCategories.create(productCategoryData);
    this.props.categories.push(newProductCategory);
    this.props.updatedAt = new Date();

    this.apply(new CategoryAssignedEvent(this, newProductCategory));
  }

  /**
   * Unassigns a category from the product.
   * @param categoryId The ID of the category to unassign.
   */
  public unassignCategory(categoryId: number): void {
    const categoryIndex = this.props.categories.findIndex(
      (pc) => pc.get('categoryId').getValue() === categoryId,
    );

    if (categoryIndex === -1) {
      throw new NotFoundException(
        `Category with ID ${categoryId} not found on product ${this.props.id.getValue()}.`,
      );
    }

    const unassignedCategory = this.props.categories.splice(
      categoryIndex,
      1,
    )[0];
    this.props.updatedAt = new Date();

    this.apply(new CategoryUnassignedEvent(this, unassignedCategory));
  }
}
