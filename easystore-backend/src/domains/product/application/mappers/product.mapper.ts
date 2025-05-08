import { Entity } from '@shared/domains/entity.base';
import {
  Product,
  ProductProps,
} from '../../aggregates/entities/product.entity';
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
import { ProductDTO } from './product.dto';
import { CreateProductDTO } from '../commands/create/product/create-product.dto';
import { CreateVariantDTO } from '../commands/create/product-variant/create-variant.dto';
import { UpdateProductDTO } from '../commands/update/product/update-product.dto';
import { UpdateVariantDTO } from '../commands/update/product-variant/update-variant.dto';
import { SoftDeleteProductDTO } from '../commands/delete/product/soft/soft-delete-product.dto';
import { HardDeleteProductDTO } from '../commands/delete/product/hard/hard-delete-product.dto';
import { DeleteVariantDTO } from '../commands/delete/product-variant/delete-variant.dto';
import { RestoreProductDTO } from '../commands/restore/restore-product.dto';

/**
 * Centralized mapper for Product domain entity to DTO conversion for queries and vice versa for commands.
 *
 */
export class ProductMapper {
  /**
   * Maps a Prisma Product model to a domain Product entity
   * @param persistenceProduct The Prisma Product model
   * @returns The mapped Product domain entity
   */
  static fromPersistence(persistenceProduct: {
    id: string;
    name: string;
    categoryId: string[];
    shortDescription: string;
    longDescription?: string;
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
    type: string;
    cover: string;
    media: string[];
    availableShippingMethods: string[];
    shippingRestrictions: string[];
    tags: string[];
    installmentPayments?: {
      months: number;
      interestRate: number;
    }[];
    acceptedPaymentMethods: string[];
    sustainability?: {
      certification: string;
      recycledPercentage: number;
    }[];
    brand?: string;
    manufacturer?: string;
    warranty?: {
      duration: string;
      coverage: string;
      instructions: string;
    };
    metadata?: {
      deleted: boolean;
      deletedAt?: Date;
      scheduledForHardDeleteAt?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return Entity.fromPersistence<
      typeof persistenceProduct,
      ProductProps,
      Product
    >(Product, persistenceProduct, (model) => ({
      id: Id.create(model.id),
      name: Name.create(model.name),
      categories: model.categoryId.map((id) => CategoryId.create(id)),
      shortDescription: ShortDescription.create(model.shortDescription),
      longDescription: model.longDescription
        ? LongDescription.create(model.longDescription)
        : undefined,
      variants: model.variants.map((variant) => Variant.create(variant)),
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
      metadata: model.metadata
        ? Metadata.create(
            model.metadata as {
              deleted: boolean;
              deletedAt?: Date;
              scheduledForHardDeleteAt?: Date;
            },
          )
        : undefined,
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
    data: Product | { products: Product[]; total: number },
    fields?: string[],
  ): ProductDTO | { products: ProductDTO[]; total: number } {
    // Handle pagination result
    if ('products' in data && 'total' in data) {
      const paginatedData = data as { products: Product[]; total: number };
      return {
        products: paginatedData.products.map(
          (product) => this.toDto(product, fields) as ProductDTO,
        ),
        total: paginatedData.total,
      };
    }

    // Handle single product
    const product = data;

    // If no fields specified, return all fields
    if (!fields || fields.length === 0) {
      return product.toDTO<ProductDTO>((entity) => ({
        id: entity.get('id').getValue(),
        name: entity.get('name').getValue(),
        categories: entity
          .get('categories')
          .map((category) => category.getValue()),
        shortDescription: entity.get('shortDescription').getValue(),
        longDescription: entity.get('longDescription')?.getValue(),
        variants: entity.get('variants').map((variant) => {
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
              variantValue.stockPerWarehouse
                ?.map((stock) => {
                  const stockMap = stock.getValue();
                  const entries = Object.entries(stockMap).map(
                    ([warehouseId, entry]) => ({
                      warehouseId: String(warehouseId),
                      qtyAvailable: entry.qtyAvailable,
                      qtyReserved: entry.qtyReserved,
                      productLocation: entry.productLocation,
                      estimatedReplenishmentDate:
                        entry.estimatedReplenishmentDate,
                      lotNumber: entry.lotNumber,
                      serialNumbers: entry.serialNumbers || [],
                    }),
                  );
                  return entries;
                })
                .flat() || [],
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
        tags: entity.get('tags').map((tag) => tag.getValue()[0]),
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
              duration: entity.get('warranty').getValue().duration,
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
        case 'categories':
          dto.categories = product
            .get('categories')
            .map((category) => category.getValue());
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
                variantValue.stockPerWarehouse
                  ?.map((stock) => {
                    const stockMap = stock.getValue();
                    const entries = Object.entries(stockMap).map(
                      ([warehouseId, entry]) => ({
                        warehouseId: String(warehouseId),
                        qtyAvailable: entry.qtyAvailable,
                        qtyReserved: entry.qtyReserved,
                        productLocation: entry.productLocation,
                        estimatedReplenishmentDate:
                          entry.estimatedReplenishmentDate,
                        lotNumber: entry.lotNumber,
                        serialNumbers: entry.serialNumbers || [],
                      }),
                    );
                    return entries;
                  })
                  .flat() || [],
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
                duration: product.get('warranty').getValue().duration,
                coverage: product.get('warranty').getValue().coverage,
                instructions: product.get('warranty').getValue().instructions,
              }
            : undefined;
          break;
        case 'metadata':
          dto.metadata = product.get('metadata')
            ? {
                deleted: product.get('metadata').getDeleted(),
                deletedAt: product.get('metadata').getDeletedAt(),
                scheduledForHardDeleteAt: product
                  .get('metadata')
                  .getScheduledForHardDeleteAt(),
              }
            : undefined;
          break;
        case 'createdAt':
          dto.createdAt = product.get('createdAt');
          break;
        case 'updatedAt':
          dto.updatedAt = product.get('updatedAt');
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
  static fromCreateDto(dto: CreateProductDTO): Product {
    // Create a new product using the factory method
    return Product.create(
      dto.name,
      dto.categories,
      dto.shortDescription,
      dto.longDescription,
      dto.variants,
      dto.type as 'PHYSICAL' | 'DIGITAL',
      dto.cover,
      dto.media,
      dto.availableShippingMethods,
      dto.shippingRestrictions,
      dto.tags,
      dto.installmentPayments,
      dto.acceptedPaymentMethods,
      dto.sustainability,
      dto.brand,
      dto.manufacturer,
      dto.warranty,
    );
  }

  static fromUpdateDto(
    dto: UpdateProductDTO,
    existingProduct: Product,
  ): Product {
    return Product.update(existingProduct, {
      name: dto.name,
      categoryIds: dto.categoryIds,
      shortDescription: dto.shortDescription,
      longDescription: dto.longDescription,
      variants: dto.variants,
      type: dto.type,
      cover: dto.cover,
      media: dto.media,
      availableShippingMethods: dto.availableShippingMethods,
      shippingRestrictions: dto.shippingRestrictions,
      tags: dto.tags,
      installmentPayments: dto.installmentPayments,
      acceptedPaymentMethods: dto.acceptedPaymentMethods,
      sustainability: dto.sustainability,
      brand: dto.brand,
      manufacturer: dto.manufacturer,
      warranty: dto.warranty,
    });
  }

  /**
   * Maps a SoftDeleteProductDTO to soft delete a Product
   * @param dto The soft delete product DTO
   * @param existingProduct The existing product to soft delete
   * @returns The soft deleted Product domain entity
   */
  static fromSoftDeleteDto(
    dto: SoftDeleteProductDTO,
    existingProduct: Product,
  ): Product {
    return Product.softDelete(existingProduct);
  }

  /**
   * Maps a HardDeleteProductDTO to hard delete a Product
   * @param dto The hard delete product DTO
   * @param existingProduct The existing product to hard delete
   * @returns The hard deleted Product domain entity
   */
  static fromHardDeleteDto(
    dto: HardDeleteProductDTO,
    existingProduct: Product,
  ): Product {
    const hardDeletedProduct = Product.hardDelete(existingProduct);
    return hardDeletedProduct.product;
  }

  /**
   * Maps a RestoreProductDTO to restore a soft-deleted Product
   * @param dto The restore product DTO
   * @param existingProduct The existing product to restore
   * @returns The restored Product domain entity
   */
  static fromRestoreDto(
    dto: RestoreProductDTO,
    existingProduct: Product,
  ): Product {
    return Product.restore(existingProduct);
  }

  /**
   * Maps a CreateVariantDTO to add a variant to an existing Product
   * @param dto The create variant DTO
   * @param existingProduct The existing product to add the variant to
   * @returns The updated Product domain entity with the new variant
   */
  static fromCreateVariantDto(
    dto: CreateVariantDTO,
    existingProduct: Product,
  ): Product {
    return Product.addVariant(existingProduct, dto.variant);
  }

  /**
   * Maps an UpdateVariantDTO to update a variant in an existing Product
   * @param dto The update variant DTO
   * @param existingProduct The existing product containing the variant to update
   * @returns The updated Product domain entity with the updated variant
   */
  static fromUpdateVariantDto(
    dto: UpdateVariantDTO,
    existingProduct: Product,
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
  static fromDeleteVariantDto(
    dto: DeleteVariantDTO,
    existingProduct: Product,
  ): Product {
    return Product.removeVariant(
      existingProduct,
      dto.identifier,
      dto.identifierType,
      dto.attributeKey,
    );
  }
}
