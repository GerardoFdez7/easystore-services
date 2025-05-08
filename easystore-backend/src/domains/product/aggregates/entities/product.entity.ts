import { Entity, EntityProps } from '@shared/domains/entity.base';
import {
  Id,
  Name,
  ShortDescription,
  LongDescription,
  Cover,
  Type,
  Variant,
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
  Metadata,
} from '../value-objects/index';
import { ProductCreatedEvent } from '../events/product/product-created.event';
import { ProductUpdatedEvent } from '../events/product/product-updated.event';
import { ProductSoftDeletedEvent } from '../events/product/product-soft-deleted.event';
import { ProductHardDeletedEvent } from '../events/product/product-hard-deleted.event';
import { ProductRestoredEvent } from '../events/product/product-restored.event';
import { VariantCreatedEvent } from '../events/product-variant/variant-created.event';
import { VariantUpdatedEvent } from '../events/product-variant/variant-updated.event';
import { VariantDeletedEvent } from '../events/product-variant/variant-deleted.event';

export interface ProductProps extends EntityProps {
  id: Id;
  name: Name;
  categories: CategoryId[];
  shortDescription: ShortDescription;
  longDescription?: LongDescription;
  variants: Variant[];
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
  static create(
    nameStr: string,
    categoryIds: string[],
    shortDescriptionStr: string,
    longDescriptionStr?: string,
    variantsData?: {
      attributes: Array<{ key: string; value: string }>;
      stockPerWarehouse: Array<{
        warehouseId: string;
        qtyAvailable: number;
        qtyReserved: number;
        productLocation: string | null;
        estimatedReplenishmentDate: Date | null;
        lotNumber: string | null;
        serialNumbers: string[];
      }>;
      price: number;
      currency: string;
      variantMedia?: string[];
      personalizationOptions?: string[];
      weight?: number;
      dimensions?: { height: number; width: number; depth: number };
      condition: string;
      sku?: string;
      upc?: string;
      ean?: string;
      isbn?: string;
      barcode?: string;
    }[],
    typeStr: 'PHYSICAL' | 'DIGITAL' = 'PHYSICAL',
    coverStr?: string,
    mediaArr: string[] = [],
    availableShippingMethodsArr: string[] = [],
    shippingRestrictionsArr: string[] = [],
    tagsArr: string[] = [],
    installmentPaymentsArr: {
      months: number;
      interestRate: number;
    }[] = [],
    acceptedPaymentMethodsArr: string[] = [],
    sustainabilityArr: {
      certification: string;
      recycledPercentage: number;
    }[] = [],
    brandStr?: string,
    manufacturerStr?: string,
    warrantyData?: {
      duration: string;
      coverage: string;
      instructions: string;
    },
  ): Product {
    const name = Name.create(nameStr);
    const categories = categoryIds.map((id) => CategoryId.create(id));
    const shortDescription = ShortDescription.create(shortDescriptionStr);
    const longDescription = longDescriptionStr
      ? LongDescription.create(longDescriptionStr)
      : undefined;
    const variants = variantsData
      ? variantsData.map((variant) => Variant.create(variant))
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
    const metadata = Metadata.create({
      deleted: false,
    });

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
      metadata,
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
      variants?: {
        attributes: Array<{ key: string; value: string }>;
        stockPerWarehouse: Array<{
          warehouseId: string;
          qtyAvailable: number;
          qtyReserved: number;
          productLocation: string | null;
          estimatedReplenishmentDate: Date | null;
          lotNumber: string | null;
          serialNumbers: string[];
        }>;
        price: number;
        currency: string;
        variantMedia?: string[];
        personalizationOptions?: string[];
        weight?: number;
        dimensions?: { height: number; width: number; depth: number };
        condition: string;
        sku?: string;
        upc?: string;
        ean?: string;
        isbn?: string;
        barcode?: string;
      }[];
      type?: 'PHYSICAL' | 'DIGITAL';
      cover?: string;
      media?: string[];
      availableShippingMethods?: string[];
      shippingRestrictions?: string[];
      tags?: string[];
      installmentPayments?: {
        months: number;
        interestRate: number;
      }[];
      acceptedPaymentMethods?: string[];
      sustainability?: {
        certification: string;
        recycledPercentage: number;
      }[];
      brand?: string | null;
      manufacturer?: string | null;
      warranty?: {
        duration: string;
        coverage: string;
        instructions: string;
      };
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
        Variant.create(variant),
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

  /**
   * Adds a new variant to an existing Product
   * @param product The existing Product
   * @param variantData The variant data to add
   * @returns The updated Product with the new variant
   */
  static addVariant(
    product: Product,
    variantData: {
      attributes: Array<{ key: string; value: string }>;
      stockPerWarehouse: Array<{
        warehouseId: string;
        qtyAvailable: number;
        qtyReserved: number;
        productLocation: string | null;
        estimatedReplenishmentDate: Date | null;
        lotNumber: string | null;
        serialNumbers: string[];
      }>;
      price: number;
      currency: string;
      variantMedia?: string[];
      personalizationOptions?: string[];
      weight?: number;
      dimensions?: { height: number; width: number; depth: number };
      condition: string;
      sku?: string;
      upc?: string;
      ean?: string;
      isbn?: string;
      barcode?: string;
    },
  ): Product {
    const props = { ...product.props };
    const newVariant = Variant.create(variantData);
    props.variants = [...props.variants, newVariant];
    props.updatedAt = new Date();

    const updatedProduct = new Product(props);
    updatedProduct.apply(new VariantCreatedEvent(updatedProduct));
    return updatedProduct;
  }

  /**
   * Updates a variant in an existing Product by its identifier
   * @param product The existing Product
   * @param identifier The identifier value of the variant to update
   * @param identifierType The type of identifier ('sku', 'upc', 'ean', 'isbn', 'barcode', or 'attribute')
   * @param updatedVariantData The new variant data
   * @param attributeKey Optional attribute key when identifierType is 'attribute'
   * @returns The updated Product with the modified variant
   */
  static updateVariant(
    product: Product,
    identifier: string,
    identifierType: 'sku' | 'upc' | 'ean' | 'isbn' | 'barcode' | 'attribute',
    updatedVariantData: {
      attributes: Array<{ key: string; value: string }>;
      stockPerWarehouse: Array<{
        warehouseId: string;
        qtyAvailable: number;
        qtyReserved: number;
        productLocation: string | null;
        estimatedReplenishmentDate: Date | null;
        lotNumber: string | null;
        serialNumbers: string[];
      }>;
      price: number;
      currency: string;
      variantMedia?: string[];
      personalizationOptions?: string[];
      weight?: number;
      dimensions?: { height: number; width: number; depth: number };
      condition: string;
      sku?: string;
      upc?: string;
      ean?: string;
      isbn?: string;
      barcode?: string;
    },
    attributeKey?: string,
  ): Product {
    const props = { ...product.props };
    const variantIndex = props.variants.findIndex((variant) => {
      const variantValue = variant.getValue();

      // First check standard identifiers (sku, upc, ean, isbn, barcode)
      // Only if identifierType is 'attribute' AND the variant doesn't have any standard identifiers
      if (identifierType === 'attribute' && attributeKey) {
        const hasStandardIdentifier = [
          'sku',
          'upc',
          'ean',
          'isbn',
          'barcode',
        ].some(
          (idType) =>
            variantValue[idType] !== undefined && variantValue[idType] !== null,
        );

        // Only use attribute-based identification if no standard identifiers exist
        if (!hasStandardIdentifier) {
          // Find if the variant has an attribute with the matching key-value pair
          const attributes = variantValue.attributes || [];
          return attributes.some(
            (attr) =>
              attr.getKey() === attributeKey && attr.getValue() === identifier,
          );
        }
      }

      // Handle standard identifiers (sku, upc, ean, isbn, barcode)
      return variantValue[identifierType] === identifier;
    });

    // If variant found, update it
    if (variantIndex !== -1) {
      const updatedVariant = Variant.create(updatedVariantData);
      props.variants = [
        ...props.variants.slice(0, variantIndex),
        updatedVariant,
        ...props.variants.slice(variantIndex + 1),
      ];
      props.updatedAt = new Date();

      const updatedProduct = new Product(props);
      updatedProduct.apply(
        new VariantUpdatedEvent(updatedProduct, updatedVariant),
      );
      return updatedProduct;
    }

    // If variant not found, return the original product
    return product;
  }

  /**
   * Removes a variant from an existing Product by its identifier
   * @param product The existing Product
   * @param identifier The identifier value
   * @param identifierType The type of identifier ('sku', 'upc', 'ean', 'isbn', 'barcode', or 'attribute')
   * @param attributeKey Optional attribute key when identifierType is 'attribute'
   * @returns The updated Product without the specified variant
   */
  static removeVariant(
    product: Product,
    identifier: string,
    identifierType: 'sku' | 'upc' | 'ean' | 'isbn' | 'barcode' | 'attribute',
    attributeKey?: string,
  ): Product {
    const props = { ...product.props };

    // Find the variant to be deleted first
    let deletedVariant: Variant = null;
    const variantIndex = props.variants.findIndex((variant) => {
      const variantValue = variant.getValue();

      // First check standard identifiers (sku, upc, ean, isbn, barcode)
      // Only if identifierType is 'attribute' AND the variant doesn't have any standard identifiers
      if (identifierType === 'attribute' && attributeKey) {
        const hasStandardIdentifier = [
          'sku',
          'upc',
          'ean',
          'isbn',
          'barcode',
        ].some(
          (idType) =>
            variantValue[idType] !== undefined && variantValue[idType] !== null,
        );

        // Only use attribute-based identification if no standard identifiers exist
        if (!hasStandardIdentifier) {
          // Find if the variant has an attribute with the matching key-value pair
          const attributes = variantValue.attributes || [];
          const hasMatchingAttribute = attributes.some(
            (attr) =>
              attr.getKey() === attributeKey && attr.getValue() === identifier,
          );
          if (hasMatchingAttribute) {
            deletedVariant = variant;
            return true;
          }
        }
        return false;
      }

      // Handle standard identifiers (sku, upc, ean, isbn, barcode)
      if (variantValue[identifierType] === identifier) {
        deletedVariant = variant;
        return true;
      }
      return false;
    });

    // If variant found, remove it
    if (variantIndex !== -1) {
      props.variants = [
        ...props.variants.slice(0, variantIndex),
        ...props.variants.slice(variantIndex + 1),
      ];
      props.updatedAt = new Date();

      const updatedProduct = new Product(props);

      // Apply domain event with the deleted variant data
      updatedProduct.apply(
        new VariantDeletedEvent(updatedProduct, deletedVariant),
      );
      return updatedProduct;
    }

    // If variant not found, return the original product
    return product;
  }
}
