import { Entity } from '@shared/domains/entity.base';
import {
  Product,
  ProductProps,
  IProductType,
  IProductBaseType,
} from '../../aggregates/entities';
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
} from '../../aggregates/value-objects/index';
import { ProductDTO, PaginatedProductsDTO, VariantDTO } from './product.dto';
import { CreateVariantDTO } from '../commands/create/product-variant/create-variant.dto';
import { UpdateProductDTO } from '../commands/update/product/update-product.dto';
import { UpdateVariantDTO } from '../commands/update/product-variant/update-variant.dto';
import { DeleteVariantDTO } from '../commands/delete/product-variant/delete-variant.dto';

/**
 * Centralized mapper for Product domain entity to DTO conversion for queries and vice versa for commands.
 * Handles mapping between persistence layer models to domain entities.
 */
export class ProductMapper {
  /**
   * Maps a persistence Product moodel to a domain Product entity
   * @param persistenceProduct The Persistence Product model
   * @returns The mapped Product domain entity
   */
  static fromPersistence(persistenceProduct: IProductType): Product {
    return Entity.fromPersistence<
      typeof persistenceProduct,
      ProductProps,
      Product
    >(Product, persistenceProduct, (model) => ({
      id: Id.create(model.id),
      name: Name.create(model.name),
      categoryId: model.categoryId?.map((id) => CategoryId.create(id)),
      shortDescription: ShortDescription.create(model.shortDescription),
      longDescription: model.longDescription
        ? LongDescription.create(model.longDescription)
        : undefined,
      variants: model.variants.map((variant) => Variant.create(variant)),
      type: Type.create(model.type),
      cover: Cover.create(model.cover),
      media: model.media?.map((item) => Media.create(item)),
      availableShippingMethods: model.availableShippingMethods.map((method) =>
        ShippingMethod.create(method),
      ),
      shippingRestrictions: model.shippingRestrictions.map((restriction) =>
        ShippingRestriction.create(restriction),
      ),
      tags: model.tags.map((tag) => Tags.create([tag])),
      installmentPayments: model.installmentPayments.map((payment) =>
        InstallmentDetail.create(payment),
      ),
      acceptedPaymentMethods: model.acceptedPaymentMethods.map((method) =>
        AcceptedPaymentMethods.create([method]),
      ),
      sustainability: model.sustainability.map((item) =>
        SustainabilityAttribute.create(item),
      ),
      brand: model.brand ? Brand.create(model.brand) : undefined,
      manufacturer: model.manufacturer
        ? Manufacturer.create(model.manufacturer)
        : undefined,
      warranty: model.warranty
        ? WarrantyDetail.create(model.warranty)
        : undefined,
      metadata: model.metadata ? Metadata.create(model.metadata) : undefined,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    }));
  }

  /**
   * Maps a Product domain entity to a ProductDTO
   * @param product The product domain entity
   * @param fields Optional array of fields to include in the DTO
   * @returns The product DTO
   */
  static toDto(
    data: Product | PaginatedProductsDTO | ProductDTO,
    fields?: string[],
  ): ProductDTO | PaginatedProductsDTO {
    // If data is already a ProductDTO, return it directly
    if (!('products' in data) && !('props' in data)) {
      return data;
    }

    // Handle pagination result
    if ('products' in data && 'total' in data) {
      const paginatedData = data as PaginatedProductsDTO;
      return {
        products: paginatedData.products.map(
          (product) => this.toDto(product, fields) as ProductDTO,
        ),
        total: paginatedData.total,
      } as PaginatedProductsDTO;
    }

    // Handle single product
    const product = data;

    // If no fields specified, return all fields
    if (!fields || fields.length === 0) {
      return product.toDTO<ProductDTO>((entity) => ({
        id: entity.get('id').getValue(),
        name: entity.get('name').getValue(),
        categoryId: entity
          .get('categoryId')
          .map((category) => category.getValue()),
        shortDescription: entity.get('shortDescription').getValue(),
        longDescription: entity.get('longDescription')?.getValue(),
        variants: entity.get('variants').map((variant) => {
          const variantValue = variant.getValue();
          return {
            attributes:
              variantValue?.attributes?.map((attr) => ({
                key: attr.getKey(),
                value: attr.getValue(),
              })) || [],
            stockPerWarehouse:
              variantValue.stockPerWarehouse?.map((stock) =>
                stock.getValue(),
              ) || [],
            price: variantValue.price.getValue(),
            currency: variantValue.currency.getValue(),
            variantMedia:
              variantValue.variantMedia?.map((media) => media.getValue()) || [],
            personalizationOptions:
              variantValue.personalizationOptions?.map((option) =>
                option.getValue(),
              ) || [],
            weight: variantValue.weight?.getValue(),
            dimensions: variantValue.dimensions?.getValue(),
            condition: variantValue.condition.getValue(),
            sku: variantValue.sku?.getValue(),
            upc: variantValue.upc?.getValue(),
            ean: variantValue.ean?.getValue(),
            isbn: variantValue.isbn?.getValue(),
            barcode: variantValue.barcode?.getValue(),
          };
        }),
        type: entity.get('type').getValue(),
        cover: entity.get('cover').getValue(),
        media: entity.get('media').map((item) => item.getValue()),
        availableShippingMethods: entity
          .get('availableShippingMethods')
          .map((method) => method.getValue()),
        shippingRestrictions: entity
          .get('shippingRestrictions')
          .map((restriction) => restriction.getValue()),
        tags: entity
          .get('tags')
          .map((tag) => tag.getValue())
          .flat(),
        installmentPayments: entity
          .get('installmentPayments')
          .map((payment) => {
            const paymentValue = payment.getValue();
            return {
              months: paymentValue.months,
              interestRate: paymentValue.interestRate,
            };
          }),
        acceptedPaymentMethods: entity
          .get('acceptedPaymentMethods')
          .map((method) => method.getValue()[0]),
        sustainability: entity.get('sustainability').map((item) => {
          const sustainabilityValue = item.getValue();
          return {
            certification: sustainabilityValue.certification,
            recycledPercentage: sustainabilityValue.recycledPercentage,
          };
        }),
        brand: entity.get('brand')?.getValue(),
        manufacturer: entity.get('manufacturer')?.getValue(),
        warranty: entity.get('warranty')
          ? {
              months: entity.get('warranty').getValue().months,
              coverage: entity.get('warranty').getValue().coverage,
              instructions: entity.get('warranty').getValue().instructions,
            }
          : undefined,
        metadata: entity.get('metadata')
          ? {
              deleted: entity.get('metadata').getDeleted(),
              deletedAt: entity.get('metadata').getDeletedAt(),
              scheduledForHardDeleteAt: entity
                .get('metadata')
                .getScheduledForHardDeleteAt(),
            }
          : undefined,
        createdAt: entity.get('createdAt'),
        updatedAt: entity.get('updatedAt'),
      }));
    }

    // Return only requested fields
    const dto: Partial<ProductDTO> = {};

    // Always include ID
    dto.id = product.get('id').getValue();

    // Map only requested fields
    fields.forEach((field) => {
      switch (field) {
        case 'name':
          dto.name = product.get('name').getValue();
          break;
        case 'categoryId':
          dto.categoryId = product
            .get('categoryId')
            ?.map((category) => category.getValue());
          break;
        case 'shortDescription':
          dto.shortDescription = product.get('shortDescription').getValue();
          break;
        case 'longDescription':
          dto.longDescription = product.get('longDescription')?.getValue();
          break;
        case 'variants':
          dto.variants = product.get('variants').map((variant) => {
            const variantValue = variant.getValue();
            return {
              attributes:
                variantValue.attributes
                  ?.map((attr) => ({
                    key: attr.getKey(),
                    value: attr.getValue(),
                  }))
                  .flat() || [],
              stockPerWarehouse:
                variantValue.stockPerWarehouse?.map((stock) => {
                  const stockMap = stock.getValue();
                  return {
                    warehouseId: stockMap.warehouseId,
                    qtyAvailable: stockMap.qtyAvailable,
                    qtyReserved: stockMap.qtyReserved,
                    productLocation: stockMap.productLocation,
                    estimatedReplenishmentDate:
                      stockMap.estimatedReplenishmentDate,
                    lotNumber: stockMap.lotNumber,
                    serialNumbers: stockMap.serialNumbers || [],
                  };
                }) || [],
              price: variantValue.price.getValue(),
              currency: String(variantValue.currency.getValue()),
              variantMedia: variantValue.variantMedia
                ?.map((media) => media.getValue())
                .flat(),
              personalizationOptions: variantValue.personalizationOptions
                ?.map((option) => option.getValue())
                .flat(),
              weight: variantValue.weight?.getValue(),
              dimensions: variantValue.dimensions?.getValue(),
              condition: variantValue.condition.getValue(),
              sku: variantValue.sku?.getValue(),
              upc: variantValue.upc?.getValue(),
              ean: variantValue.ean?.getValue(),
              isbn: variantValue.isbn?.getValue(),
              barcode: variantValue.barcode?.getValue(),
            };
          });
          break;
        case 'type':
          dto.type = product.get('type').getValue();
          break;
        case 'cover':
          dto.cover = product.get('cover').getValue();
          break;
        case 'media':
          dto.media = product.get('media').map((item) => item.getValue());
          break;
        case 'availableShippingMethods':
          dto.availableShippingMethods = product
            .get('availableShippingMethods')
            .map((method) => method.getValue());
          break;
        case 'shippingRestrictions':
          dto.shippingRestrictions = product
            .get('shippingRestrictions')
            .map((restriction) => restriction.getValue());
          break;
        case 'tags':
          dto.tags = product.get('tags').map((tag) => tag.getValue()[0]);
          break;
        case 'installmentPayments':
          dto.installmentPayments = product
            .get('installmentPayments')
            .map((payment) => {
              const paymentValue = payment.getValue();
              return {
                months: paymentValue.months,
                interestRate: paymentValue.interestRate,
              };
            });
          break;
        case 'acceptedPaymentMethods':
          dto.acceptedPaymentMethods = product
            .get('acceptedPaymentMethods')
            .map((method) => method.getValue()[0]);
          break;
        case 'sustainability':
          dto.sustainability = product.get('sustainability').map((item) => {
            const sustainabilityValue = item.getValue();
            return {
              certification: sustainabilityValue.certification,
              recycledPercentage: sustainabilityValue.recycledPercentage,
            };
          });
          break;
        case 'brand':
          dto.brand = product.get('brand')?.getValue();
          break;
        case 'manufacturer':
          dto.manufacturer = product.get('manufacturer')?.getValue();
          break;
        case 'warranty':
          dto.warranty = product.get('warranty')
            ? {
                months: product.get('warranty').getValue().months,
                coverage: product.get('warranty').getValue().coverage,
                instructions: product.get('warranty').getValue().instructions,
              }
            : undefined;
          break;
      }
    });

    return dto as ProductDTO;
  }

  /**
   * Maps an array of Product domain entities to an array of ProductDTOs
   * @param products The array of product domain entities
   * @param fields Optional array of fields to include in the DTOs
   * @returns Array of product DTOs
   */
  static toDtoArray(products: Product[], fields?: string[]): ProductDTO[] {
    return products.map((product) => this.toDto(product, fields) as ProductDTO);
  }

  /**
   * Maps a ProductDTO to a domain entity
   * @param dto The product DTO
   * @returns The mapped Product domain entity
   */
  static fromCreateDto(
    dto: IProductBaseType & { variants?: VariantDTO[] },
  ): Product {
    return Product.create({ ...(dto as IProductType) });
  }

  static fromUpdateDto(
    existingProduct: Product,
    dto: UpdateProductDTO,
  ): Product {
    return Product.update(existingProduct, { ...dto });
  }

  /**
   * Maps a SoftDeleteProductDTO to soft delete a Product
   * @param existingProduct The existing product to soft delete
   * @returns The soft deleted Product domain entity
   */
  static fromSoftDeleteDto(existingProduct: Product): Product {
    return Product.softDelete(existingProduct);
  }

  /**
   * Maps a HardDeleteProductDTO to hard delete a Product
   * @param existingProduct The existing product to hard delete
   * @returns The hard deleted Product domain entity
   */
  static fromHardDeleteDto(existingProduct: Product): {
    shouldRemove: true;
    product: Product;
  } {
    return Product.hardDelete(existingProduct);
  }

  /**
   * Maps a RestoreProductDTO to restore a soft-deleted Product
   * @param existingProduct The existing product to restore
   * @returns The restored Product domain entity
   */
  static fromRestoreDto(existingProduct: Product): Product {
    return Product.restore(existingProduct);
  }

  /**
   * Maps a CreateVariantDTO to add a variant to an existing Product
   * @param existingProduct The existing product to add the variant to
   * @param variant The processed variant object
   * @returns The updated Product domain entity with the new variant
   */
  static addVariantToProduct(
    existingProduct: Product,
    variant: CreateVariantDTO['variant'],
  ): Product {
    return Product.addVariant(existingProduct, variant);
  }

  /**
   * Maps an UpdateVariantDTO to update a variant in an existing Product
   * @param dto The update variant DTO
   * @param existingProduct The existing product containing the variant to update
   * @returns The updated Product domain entity with the updated variant
   */
  static updateVariantOfProduct(
    existingProduct: Product,
    dto: UpdateVariantDTO,
  ): Product {
    return Product.updateVariant(
      existingProduct,
      dto.identifier,
      dto.identifierType,
      dto.variant,
      dto.attributeKey,
    );
  }

  /**
   * Maps a DeleteVariantDTO to delete a variant from an existing Product
   * @param dto The delete variant DTO
   * @param existingProduct The existing product containing the variant to delete
   * @returns The updated Product domain entity with the variant removed
   */
  static deleteVariantOfProduct(
    existingProduct: Product,
    dto: DeleteVariantDTO,
  ): Product {
    return Product.removeVariant(
      existingProduct,
      dto.identifier,
      dto.identifierType,
      dto.attributeKey,
    );
  }
}
