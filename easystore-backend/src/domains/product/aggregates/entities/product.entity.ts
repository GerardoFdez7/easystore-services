import { Entity, EntityProps } from '@shared/domains/entity.base';
import {
  Id,
  Name,
  ShortDescription,
  LongDescription,
  Cover,
  Type,
  Variants,
  CategoryId,
  Media,
  ShippingMethod,
  ShippingRestriction,
  Tags,
  InstallmentDetail,
  AcceptedPaymentMethods,
  SustainabilityAttribute,
  Brand,
  Manufacturer,
  WarrantyDetail,
} from '../value-objects/index';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductUpdatedEvent } from '../events/product-updated.event';
import { ProductDeletedEvent } from '../events/product-deleted.event';

interface ProductProps extends EntityProps {
  id: Id;
  name: Name;
  categories: CategoryId[];
  shortDescription: ShortDescription;
  longDescription?: LongDescription;
  variants: Variants[];
  type: Type;
  cover: Cover;
  media: Media[];
  availableShippingMethods: ShippingMethod[];
  shippingRestrictions: ShippingRestriction[];
  tags: Tags[];
  installmentPayments: InstallmentDetail[];
  acceptedPaymentMethods: AcceptedPaymentMethods[];
  sustainability: SustainabilityAttribute[];
  brand?: Brand;
  manufacturer?: Manufacturer;
  warranty?: WarrantyDetail;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Entity<ProductProps> {
  constructor(props: ProductProps) {
    super(props);
  }

  /**
   * Maps a Prisma Product model to a domain Product entity
   * @param prismaProduct The Prisma Product model
   * @returns The mapped Product domain entity
   */
  static fromPrisma(prismaProduct: {
    id: string;
    name: string;
    categoryId: string[];
    shortDescription: string;
    longDescription?: string;
    variants: unknown[];
    type: string;
    cover: string;
    media: string[];
    availableShippingMethods: string[];
    shippingRestrictions: string[];
    tags: string[];
    installmentPayments: unknown[];
    acceptedPaymentMethods: string[];
    sustainability: unknown[];
    brand?: string;
    manufacturer?: string;
    warranty?: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return Entity.fromPersistence<typeof prismaProduct, ProductProps, Product>(
      Product,
      prismaProduct,
      (model) => ({
        id: Id.create(model.id),
        name: Name.create(model.name),
        categories: model.categoryId.map((id) => CategoryId.create(id)),
        shortDescription: ShortDescription.create(model.shortDescription),
        longDescription: model.longDescription
          ? LongDescription.create(model.longDescription)
          : undefined,
        variants: model.variants.map((variant) => Variants.create(variant)),
        type: Type.create(model.type),
        cover: Cover.create(model.cover),
        media: model.media.map((item) => Media.create(item)),
        availableShippingMethods: model.availableShippingMethods.map((method) =>
          ShippingMethod.create(method),
        ),
        shippingRestrictions: model.shippingRestrictions.map((restriction) =>
          ShippingRestriction.create(restriction),
        ),
        tags: model.tags.map((tag) => Tags.create([tag])),
        installmentPayments: model.installmentPayments.map((payment) =>
          InstallmentDetail.create(
            payment as { months: number; interestRate: number },
          ),
        ),
        acceptedPaymentMethods: model.acceptedPaymentMethods.map((method) =>
          AcceptedPaymentMethods.create([method]),
        ),
        sustainability: model.sustainability.map((item) =>
          SustainabilityAttribute.create(
            item as { certification: string; recycledPercentage: number },
          ),
        ),
        brand: model.brand ? Brand.create(model.brand) : undefined,
        manufacturer: model.manufacturer
          ? Manufacturer.create(model.manufacturer)
          : undefined,
        warranty: model.warranty
          ? WarrantyDetail.create(
              model.warranty as {
                duration: string;
                coverage: string;
                instructions: string;
              },
            )
          : undefined,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      }),
    );
  }

  /**
   * Factory method to create a new Product
   * @returns The created Product domain entity
   */
  static create(
    nameStr: string,
    categoryIds: string[],
    shortDescriptionStr: string,
    longDescriptionStr?: string,
    variantsData?: unknown[],
    typeStr: 'PHYSICAL' | 'DIGITAL' = 'PHYSICAL',
    coverStr?: string,
    mediaArr: string[] = [],
    availableShippingMethodsArr: string[] = [],
    shippingRestrictionsArr: string[] = [],
    tagsArr: string[] = [],
    installmentPaymentsArr: unknown[] = [],
    acceptedPaymentMethodsArr: string[] = [],
    sustainabilityArr: unknown[] = [],
    brandStr?: string,
    manufacturerStr?: string,
    warrantyData?: unknown,
  ): Product {
    const name = Name.create(nameStr);
    const categories = categoryIds.map((id) => CategoryId.create(id));
    const shortDescription = ShortDescription.create(shortDescriptionStr);
    const longDescription = longDescriptionStr
      ? LongDescription.create(longDescriptionStr)
      : undefined;
    const variants = variantsData
      ? variantsData.map((variant) => Variants.create(variant))
      : [];
    const type = Type.create(typeStr);
    const cover = coverStr
      ? Cover.create(coverStr)
      : Cover.create('default-cover.jpg');
    const media = mediaArr.map((item) => Media.create(item));
    const availableShippingMethods = availableShippingMethodsArr.map((method) =>
      ShippingMethod.create(method),
    );
    const shippingRestrictions = shippingRestrictionsArr.map((restriction) =>
      ShippingRestriction.create(restriction),
    );
    const tags = tagsArr.map((tag) => Tags.create([tag]));
    const installmentPayments = installmentPaymentsArr.map((payment) =>
      InstallmentDetail.create(
        payment as { months: number; interestRate: number },
      ),
    );
    const acceptedPaymentMethods = acceptedPaymentMethodsArr.map((method) =>
      AcceptedPaymentMethods.create([method]),
    );
    const sustainability = sustainabilityArr.map((item) =>
      SustainabilityAttribute.create(
        item as { certification: string; recycledPercentage: number },
      ),
    );
    const brand = brandStr ? Brand.create(brandStr) : undefined;
    const manufacturer = manufacturerStr
      ? Manufacturer.create(manufacturerStr)
      : undefined;
    const warranty = warrantyData
      ? WarrantyDetail.create(
          warrantyData as {
            duration: string;
            coverage: string;
            instructions: string;
          },
        )
      : undefined;

    const product = new Product({
      id: null,
      name,
      categories,
      shortDescription,
      longDescription,
      variants,
      type,
      cover,
      media,
      availableShippingMethods,
      shippingRestrictions,
      tags,
      installmentPayments,
      acceptedPaymentMethods,
      sustainability,
      brand,
      manufacturer,
      warranty,
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
    updates: {
      name?: string;
      categoryIds?: string[];
      shortDescription?: string;
      longDescription?: string | null;
      variants?: unknown[];
      type?: 'PHYSICAL' | 'DIGITAL';
      cover?: string;
      media?: string[];
      availableShippingMethods?: string[];
      shippingRestrictions?: string[];
      tags?: string[];
      installmentPayments?: unknown[];
      acceptedPaymentMethods?: string[];
      sustainability?: unknown[];
      brand?: string | null;
      manufacturer?: string | null;
      warranty?: unknown;
    },
  ): Product {
    const props = { ...product.props };

    // Update each property if provided in updates
    if (updates.name !== undefined) {
      props.name = Name.create(updates.name);
    }

    if (updates.categoryIds !== undefined) {
      props.categories = updates.categoryIds.map((id) => CategoryId.create(id));
    }

    if (updates.shortDescription !== undefined) {
      props.shortDescription = ShortDescription.create(
        updates.shortDescription,
      );
    }

    if (updates.longDescription !== undefined) {
      props.longDescription = updates.longDescription
        ? LongDescription.create(updates.longDescription)
        : undefined;
    }

    if (updates.variants !== undefined) {
      props.variants = updates.variants.map((variant) =>
        Variants.create(variant),
      );
    }

    if (updates.type !== undefined) {
      props.type = Type.create(updates.type);
    }

    if (updates.cover !== undefined) {
      props.cover = Cover.create(updates.cover);
    }

    if (updates.media !== undefined) {
      props.media = updates.media.map((item) => Media.create(item));
    }

    if (updates.availableShippingMethods !== undefined) {
      props.availableShippingMethods = updates.availableShippingMethods.map(
        (method) => ShippingMethod.create(method),
      );
    }

    if (updates.shippingRestrictions !== undefined) {
      props.shippingRestrictions = updates.shippingRestrictions.map(
        (restriction) => ShippingRestriction.create(restriction),
      );
    }

    if (updates.tags !== undefined) {
      props.tags = updates.tags.map((tag) => Tags.create([tag]));
    }

    if (updates.installmentPayments !== undefined) {
      props.installmentPayments = updates.installmentPayments.map((payment) =>
        InstallmentDetail.create(
          payment as { months: number; interestRate: number },
        ),
      );
    }

    if (updates.acceptedPaymentMethods !== undefined) {
      props.acceptedPaymentMethods = updates.acceptedPaymentMethods.map(
        (method) => AcceptedPaymentMethods.create([method]),
      );
    }

    if (updates.sustainability !== undefined) {
      props.sustainability = updates.sustainability.map((item) =>
        SustainabilityAttribute.create(
          item as { certification: string; recycledPercentage: number },
        ),
      );
    }

    if (updates.brand !== undefined) {
      props.brand = updates.brand ? Brand.create(updates.brand) : undefined;
    }

    if (updates.manufacturer !== undefined) {
      props.manufacturer = updates.manufacturer
        ? Manufacturer.create(updates.manufacturer)
        : undefined;
    }

    if (updates.warranty !== undefined) {
      props.warranty = updates.warranty
        ? WarrantyDetail.create(
            updates.warranty as {
              duration: string;
              coverage: string;
              instructions: string;
            },
          )
        : undefined;
    }

    // Update the updatedAt timestamp
    props.updatedAt = new Date();

    const updatedProduct = new Product(props);

    // Apply domain event
    updatedProduct.apply(new ProductUpdatedEvent(updatedProduct));

    return updatedProduct;
  }

  /**
   * Marks a Product as deleted
   * @param product The Product to delete
   * @returns The deleted Product domain entity
   */
  static delete(product: Product): Product {
    // In the real application, we might set a deleted flag or implement soft delete
    // For this example, I'll just apply the deleted event
    product.apply(new ProductDeletedEvent(product));
    return product;
  }

  /**
   * Adds a new variant to an existing Product
   * @param product The existing Product
   * @param variantData The variant data to add
   * @returns The updated Product with the new variant
   */
  static addVariant(product: Product, variantData: unknown): Product {
    const props = { ...product.props };
    const newVariant = Variants.create(variantData);
    props.variants = [...props.variants, newVariant];
    props.updatedAt = new Date();

    const updatedProduct = new Product(props);
    updatedProduct.apply(new ProductUpdatedEvent(updatedProduct));
    return updatedProduct;
  }

  /**
   * Removes a variant from an existing Product by its identifier (SKU, UPC, etc.)
   * @param product The existing Product
   * @param identifier The identifier value (SKU, UPC, etc.)
   * @param identifierType The type of identifier ('sku', 'upc', 'ean', etc.)
   * @returns The updated Product without the specified variant
   */
  static removeVariant(
    product: Product,
    //identifier: string,
    //identifierType: 'sku' | 'upc' | 'ean' | 'isbn' | 'barcode' = 'sku',
  ): Product {
    const props = { ...product.props };

    // Filter out the variant with the matching identifier
    // props.variants = props.variants.filter((variant) => {
    //   const variantValue = variant.getValue();
    //   return variantValue[identifierType] !== identifier;
    // });

    props.updatedAt = new Date();

    const updatedProduct = new Product(props);
    updatedProduct.apply(new ProductUpdatedEvent(updatedProduct));
    return updatedProduct;
  }
}
