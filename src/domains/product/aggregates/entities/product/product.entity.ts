import {
  Id,
  Name,
  ShortDescription,
  LongDescription,
  Media as MediaVO,
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
  longDescription?: LongDescription;
  productType: Type;
  cover: MediaVO;
  tags?: Tags[];
  brand?: Brand;
  manufacturer?: Manufacturer;
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
  private variantsMap: Map<string, Variant>;

  private constructor(props: IProductProps) {
    super(props);
    this.variantsMap = new Map();
    props.variants.forEach((variant) => {
      const variantId = variant.get('id');
      if (variantId && variantId.getValue() !== undefined) {
        this.variantsMap.set(variantId.getValue(), variant);
      }
    });
  }

  /**
   * Factory method to reconstitute a Product from persistence or other sources.
   * Assumes all props, including ID and child entities, are already in domain format.
   * @param props The complete properties of the product.
   * @returns The reconstituted Product domain entity.
   */
  static reconstitute(props: IProductProps): Product {
    const product = new Product(props);
    product.variantsMap = new Map();
    props.variants.forEach((variant) => {
      const variantId = variant.get('id');
      if (
        variantId &&
        variantId.getValue() !== null &&
        variantId.getValue() !== undefined
      ) {
        product.variantsMap.set(variantId.getValue(), variant);
      }
    });
    return product;
  }

  /**
   * Factory method to create a new Product
   * @returns The created Product domain entity
   */
  static create(props: IProductBase): Product {
    if (!props.variants || props.variants.length === 0) {
      throw new Error('A product must have at least one variant.');
    }

    const transformedProps = {
      name: Name.create(props.name),
      shortDescription: ShortDescription.create(props.shortDescription),
      longDescription: props.longDescription
        ? LongDescription.create(props.longDescription)
        : null,
      productType: Type.create(props.productType),
      cover: MediaVO.createCover(props.cover),
      tags: (props.tags || []).map((tag) => Tags.create([tag])),
      brand: props.brand ? Brand.create(props.brand) : null,
      manufacturer: props.manufacturer
        ? Manufacturer.create(props.manufacturer)
        : null,
      tenantId: Id.create(props.tenantId),
    };
    // Creation of related entities
    // This ID represents the product being created.
    const newProductIdValue = Id.generate();
    const productTenantId = transformedProps.tenantId;

    const variants = props.variants.map((variantData) =>
      Variant.create({
        ...variantData,
        productId: newProductIdValue.getValue(),
        tenantId: productTenantId.getValue(),
      }),
    );

    const media = (props.media || []).map((mediaData) =>
      Media.create({
        ...mediaData,
        productId: newProductIdValue.getValue(),
      }),
    );

    const categories = (props.categories || []).map((categoryData) =>
      ProductCategories.create({
        ...categoryData,
        productId: newProductIdValue.getValue(),
      }),
    );

    const sustainabilities = (props.sustainabilities || []).map(
      (sustainabilityData) =>
        Sustainability.create({
          ...sustainabilityData,
          productId: newProductIdValue.getValue(),
        }),
    );

    const product = new Product({
      id: newProductIdValue,
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

    if (updates.name !== undefined) {
      props.name = Name.create(updates.name);
    }

    if (updates.shortDescription !== undefined) {
      props.shortDescription = ShortDescription.create(
        updates.shortDescription,
      );
    }

    if (updates.longDescription !== undefined) {
      props.longDescription = updates.longDescription
        ? LongDescription.create(updates.longDescription)
        : null;
    }

    if (updates.productType !== undefined) {
      props.productType = Type.create(updates.productType);
    }

    if (updates.cover !== undefined) {
      props.cover = MediaVO.createCover(updates.cover);
    }

    if (updates.variants !== undefined) {
      if (!updates.variants || updates.variants.length === 0) {
        throw new Error('A product must have at least one variant.');
      }
      props.variants = updates.variants.map((variantData) =>
        Variant.create({
          ...variantData,
          productId: product.props.id.getValue(),
          tenantId: product.props.tenantId.getValue(),
        }),
      );
    }

    if (updates.tags !== undefined) {
      props.tags = updates.tags.map((tag) => Tags.create([tag]));
    }

    if (updates.brand !== undefined) {
      props.brand = updates.brand ? Brand.create(updates.brand) : null;
    }

    if (updates.manufacturer !== undefined) {
      props.manufacturer = updates.manufacturer
        ? Manufacturer.create(updates.manufacturer)
        : null;
    }

    if (updates.media !== undefined) {
      props.media = updates.media.map((mediaData) =>
        Media.create({
          ...mediaData,
          productId: product.props.id.getValue(),
        }),
      );
    }

    if (updates.categories !== undefined) {
      props.categories = updates.categories.map((categoryData) =>
        ProductCategories.create({
          ...categoryData,
          productId: product.props.id.getValue(),
        }),
      );
    }

    if (updates.sustainabilities !== undefined) {
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

  private getVariantOrThrow(variantId: string): Variant {
    const variant = this.variantsMap.get(variantId);
    if (!variant) {
      throw new Error(
        `Variant with ID ${variantId} not found on product ${this.props.id.getValue()}.`,
      );
    }
    return variant;
  }

  /**
   * Adds a new variant to the product.
   * @param variantData The data for the new variant, conforming to IVariantBase.
   */
  public addVariant(variantData: IVariantBase): Product {
    const newVariant = Variant.create({
      ...variantData,
      // productId is likely null if the product itself is new and not yet persisted.
      // This needs careful handling. For now, we assume this.props.id is available.
      productId: this.props.id ? this.props.id.getValue() : null,
      tenantId: this.props.tenantId.getValue(),
    });

    const newVariants = [...this.props.variants, newVariant];
    const newProps = {
      ...this.props,
      variants: newVariants,
      updatedAt: new Date(),
    };

    // When a new Product is created, its variantsMap will be rebuilt by the constructor.
    const updatedProduct = new Product(newProps);
    // It's important that the event is applied to the *new* product instance.
    updatedProduct.apply(new VariantCreatedEvent(updatedProduct, newVariant));
    return updatedProduct;
  }

  /**
   * Updates an existing variant of the product.
   * @param variantId The ID of the variant to update.
   * @param updateData The data to update the variant with, conforming to Partial<IVariantBase>.
   */
  public updateVariant(
    variantId: string,
    updateData: Partial<IVariantBase>,
  ): Product {
    const variantToUpdate = this.getVariantOrThrow(variantId);
    const updatedVariant = variantToUpdate.update(updateData);

    const newVariants = this.props.variants.map((v) => {
      const currentVariantId = v.get('id');
      return currentVariantId && currentVariantId.getValue() === variantId
        ? updatedVariant
        : v;
    });

    const newProps = {
      ...this.props,
      variants: newVariants,
      updatedAt: new Date(),
    };
    const updatedProduct = new Product(newProps);
    updatedProduct.apply(
      new VariantUpdatedEvent(updatedProduct, updatedVariant),
    );
    return updatedProduct;
  }

  /**
   * Soft deletes a variant from the product.
   * @param variantId The ID of the variant to soft delete.
   */
  public archiveVariant(variantId: string): Product {
    const variantToArchive = this.getVariantOrThrow(variantId);

    // Check if the product is already archived
    const isArchived = variantToArchive.get('isArchived');
    if (isArchived === true) {
      throw new Error(
        `Variant with ID ${variantId} is already archived and cannot be archived again`,
      );
    }

    const archivedVariant = variantToArchive.archive();
    const newVariants = this.props.variants.map((v) =>
      v.get('id').getValue() === variantId ? archivedVariant : v,
    );
    const newProps = {
      ...this.props,
      variants: newVariants,
      updatedAt: new Date(),
    };

    const updatedProduct = new Product(newProps);
    updatedProduct.apply(
      new VariantArchivedEvent(updatedProduct, archivedVariant),
    );
    return updatedProduct;
  }

  /**
   * Restores a previously soft-deleted variant.
   * @param variantId The ID of the variant to restore.
   */
  public restoreVariant(variantId: string): Product {
    const variantToRestore = this.getVariantOrThrow(variantId);

    // Check if the variant is actually deleted
    const isArchived = variantToRestore.get('isArchived');
    if (isArchived === false) {
      throw new Error(
        `Variant with ID ${variantId} is not in a deleted state and cannot be restored`,
      );
    }

    const restoredVariant = variantToRestore.restore();
    const newVariants = this.props.variants.map((v) =>
      v.get('id').getValue() === variantId ? restoredVariant : v,
    );
    const newProps = {
      ...this.props,
      variants: newVariants,
      updatedAt: new Date(),
    };

    const updatedProduct = new Product(newProps);
    updatedProduct.apply(
      new VariantRestoredEvent(updatedProduct, restoredVariant),
    );
    return updatedProduct;
  }

  /**
   * Removes a variant from the product.
   * @param variantId The ID of the variant to remove.
   */
  public removeVariant(variantId: string): Product {
    const variantToRemove = this.getVariantOrThrow(variantId);

    const newVariants = this.props.variants.filter(
      (v) => v.get('id').getValue() !== variantId,
    );
    const newProps = {
      ...this.props,
      variants: newVariants,
      updatedAt: new Date(),
    };

    const updatedProduct = new Product(newProps);
    updatedProduct.apply(
      new VariantDeletedEvent(updatedProduct, variantToRemove),
    );
    return updatedProduct;
  }
}
