import {
  Entity,
  Product,
  IProductProps,
  IProductType,
  IProductBase,
} from '../../../aggregates/entities';
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
} from '../../../aggregates/value-objects';
import {
  ProductDTO,
  PaginatedProductsDTO,
  MediaMapper,
  VariantMapper,
  ProductCategoriesMapper,
  SustainabilityMapper,
} from '../';
import { UpdateProductDTO } from '../../commands';

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
      IProductProps,
      Product
    >(Product, persistenceProduct, (model) => ({
      id: Id.create(model.id),
      name: Name.create(model.name),
      shortDescription: ShortDescription.create(model.shortDescription),
      longDescription: model.longDescription
        ? LongDescription.create(model.longDescription)
        : null,
      productType: Type.create(model.productType),
      cover: Cover.create(model.cover),
      tags: model.tags ? model.tags.map((tag) => Tags.create([tag])) : [],
      brand: model.brand ? Brand.create(model.brand) : null,
      manufacturer: model.manufacturer
        ? Manufacturer.create(model.manufacturer)
        : null,
      metadata: Metadata.create(model.metadata),
      tenantId: Id.create(model.tenantId),
      updatedAt: model.updatedAt,
      createdAt: model.createdAt,
      variants: model.variants.map((variantItem) =>
        VariantMapper.fromPersistence(variantItem),
      ),
      media: model.media.map((mediaItem) =>
        MediaMapper.fromPersistence(mediaItem),
      ),
      categories: model.categories.map((categoryItem) =>
        ProductCategoriesMapper.fromPersistence(categoryItem),
      ),
      sustainabilities: model.sustainabilities.map((sustainabilityItem) =>
        SustainabilityMapper.fromPersistence(sustainabilityItem),
      ),
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
        id: entity.get('id')?.getValue() ?? null,
        name: entity.get('name')?.getValue() ?? null,
        shortDescription: entity.get('shortDescription')?.getValue() ?? null,
        longDescription: entity.get('longDescription')?.getValue() ?? null,
        productType: entity.get('productType')?.getValue() ?? null,
        cover: entity.get('cover')?.getValue() ?? null,
        tags:
          entity
            .get('tags')
            .map((tag) => tag.getValue())
            .flat() ?? [],
        brand: entity.get('brand')?.getValue() ?? null,
        manufacturer: entity.get('manufacturer')?.getValue() ?? null,
        metadata: entity.get('metadata')
          ? {
              deleted: entity.get('metadata')?.getDeleted() ?? null,
              deletedAt: entity.get('metadata')?.getDeletedAt() ?? null,
              scheduledForHardDeleteAt:
                entity.get('metadata')?.getScheduledForHardDeleteAt() ?? null,
            }
          : null,
        tenantId: entity.get('id')?.getValue() ?? null,
        updatedAt: entity.get('updatedAt') ?? null,
        createdAt: entity.get('createdAt') ?? null,
        variants:
          entity
            .get('variants')
            .map((variant) => VariantMapper.toDto(variant)) ?? [],
        media:
          entity.get('media').map((media) => MediaMapper.toDto(media)) ?? [],
        categories:
          entity
            .get('categories')
            .map((category) => ProductCategoriesMapper.toDto(category)) ?? [],
        sustainabilities:
          entity
            .get('sustainabilities')
            .map((sustainability) =>
              SustainabilityMapper.toDto(sustainability),
            ) ?? [],
      }));
    }

    // Return only requested fields
    const dto: Partial<ProductDTO> = {};

    // Always include ID
    dto.id = product.get('id')?.getValue() ?? null;

    // Map only requested fields
    fields.forEach((field) => {
      switch (field) {
        case 'name':
          dto.name = product.get('name')?.getValue() ?? null;
          break;
        case 'shortDescription':
          dto.shortDescription =
            product.get('shortDescription')?.getValue() ?? null;
          break;
        case 'longDescription':
          dto.longDescription =
            product.get('longDescription')?.getValue() ?? null;
          break;
        case 'productType':
          dto.productType = product.get('productType')?.getValue() ?? null;
          break;
        case 'cover':
          dto.cover = product.get('cover')?.getValue() ?? null;
          break;
        case 'tags':
          dto.tags = product.get('tags').map((tag) => tag.getValue()[0]) ?? [];
          break;
        case 'brand':
          dto.brand = product.get('brand')?.getValue() ?? null;
          break;
        case 'manufacturer':
          dto.manufacturer = product.get('manufacturer')?.getValue() ?? null;
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
  static fromCreateDto(dto: IProductBase): Product {
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
}
