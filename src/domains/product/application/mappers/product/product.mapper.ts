import {
  Product,
  IProductProps,
  IProductType,
  IProductBase,
  IVariantBase,
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
} from '../../../aggregates/value-objects';
import {
  ProductDTO,
  PaginatedProductsDTO,
  MediaMapper,
  VariantMapper,
  ProductCategoriesMapper,
  SustainabilityMapper,
} from '../';
import { UpdateProductDTO, UpdateVariantDTO } from '../../commands';

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
    const productProps: IProductProps = {
      id: Id.create(persistenceProduct.id),
      name: Name.create(persistenceProduct.name),
      shortDescription: ShortDescription.create(
        persistenceProduct.shortDescription,
      ),
      longDescription: persistenceProduct.longDescription
        ? LongDescription.create(persistenceProduct.longDescription)
        : null,
      productType: Type.create(persistenceProduct.productType),
      cover: Cover.create(persistenceProduct.cover),
      tags: persistenceProduct.tags
        ? persistenceProduct.tags.map((tag) => Tags.create([tag]))
        : [],
      brand: persistenceProduct.brand
        ? Brand.create(persistenceProduct.brand)
        : null,
      manufacturer: persistenceProduct.manufacturer
        ? Manufacturer.create(persistenceProduct.manufacturer)
        : null,
      isArchived: persistenceProduct.isArchived,
      tenantId: Id.create(persistenceProduct.tenantId),
      updatedAt: persistenceProduct.updatedAt,
      createdAt: persistenceProduct.createdAt,
      variants: (persistenceProduct.variants || []).map((variantItem) =>
        VariantMapper.fromPersistence(variantItem),
      ),
      media: (persistenceProduct.media || []).map((mediaItem) =>
        MediaMapper.fromPersistence(mediaItem),
      ),
      categories: (persistenceProduct.categories || []).map((categoryItem) =>
        ProductCategoriesMapper.fromPersistence(categoryItem),
      ),
      sustainabilities: (persistenceProduct.sustainabilities || []).map(
        (sustainabilityItem) =>
          SustainabilityMapper.fromPersistence(sustainabilityItem),
      ),
    };
    return Product.reconstitute(productProps);
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
        hasMore: paginatedData.hasMore,
      } as PaginatedProductsDTO;
    }

    // Handle single product
    const product = data;

    // If no fields specified, return all fields
    if (!fields || fields.length === 0) {
      return product.toDTO<ProductDTO>((entity) => ({
        id: entity.get('id')?.getValue(),
        name: entity.get('name')?.getValue(),
        shortDescription: entity.get('shortDescription')?.getValue(),
        longDescription: entity.get('longDescription')?.getValue(),
        productType: entity.get('productType')?.getValue(),
        cover: entity.get('cover')?.getValue(),
        tags:
          entity
            .get('tags')
            .map((tag) => tag.getValue())
            .flat() ?? [],
        brand: entity.get('brand')?.getValue(),
        manufacturer: entity.get('manufacturer')?.getValue(),
        isArchived: entity.get('isArchived'),
        tenantId: entity.get('tenantId')?.getValue(),
        updatedAt: entity.get('updatedAt'),
        createdAt: entity.get('createdAt'),
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
    dto.id = product.get('id')?.getValue();

    // Map only requested fields
    fields.forEach((field) => {
      switch (field) {
        case 'name':
          dto.name = product.get('name')?.getValue();
          break;
        case 'shortDescription':
          dto.shortDescription = product.get('shortDescription')?.getValue();
          break;
        case 'longDescription':
          dto.longDescription = product.get('longDescription')?.getValue();
          break;
        case 'productType':
          dto.productType = product.get('productType')?.getValue();
          break;
        case 'cover':
          dto.cover = product.get('cover')?.getValue();
          break;
        case 'tags':
          dto.tags = product.get('tags').map((tag) => tag.getValue()[0]) ?? [];
          break;
        case 'brand':
          dto.brand = product.get('brand')?.getValue();
          break;
        case 'manufacturer':
          dto.manufacturer = product.get('manufacturer')?.getValue();
          break;
        case 'tenantId':
          dto.tenantId = product.get('tenantId')?.getValue();
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
    return Product.create({ ...dto });
  }

  /**
   * Maps an UpdateProductDTO to update an existing Product domain entity
   * @param existingProduct The existing product to update
   * @param dto The DTO containing the update data
   * @returns The updated Product domain entity
   */
  static fromUpdateDto(
    existingProduct: Product,
    dto: UpdateProductDTO,
  ): Product {
    return Product.update(existingProduct, dto.data);
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
  static fromHardDeleteDto(existingProduct: Product): Product {
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

  // --- Variant Management ---

  /**
   * Maps an AddVariantDTO to call addVariant on Product entity
   * @param existingProduct The existing product
   * @param dto The DTO containing variant data
   * @returns The product with the new variant added
   */
  static fromAddVariantDto(
    existingProduct: Product,
    dto: IVariantBase,
  ): Product {
    const updatedProduct = existingProduct.addVariant(dto);
    return updatedProduct;
  }

  /**
   * Maps an UpdateVariantDTO to call updateVariant on Product entity
   * @param existingProduct The existing product
   * @param variantId The ID of the variant to update
   * @param dto The DTO containing variant update data
   * @returns The product with the variant updated
   */
  static fromUpdateVariantDto(
    existingProduct: Product,
    variantId: string,
    dto: UpdateVariantDTO,
  ): Product {
    const updatedProduct = existingProduct.updateVariant(
      variantId,
      dto.data as Partial<IVariantBase>,
    );
    return updatedProduct;
  }

  /**
   * Maps a variant ID to call archiveVariant on Product entity
   * @param existingProduct The existing product
   * @param variantId The ID of the variant to archive
   * @returns The product with the variant archived
   */
  static fromArchiveVariantDto(
    existingProduct: Product,
    variantId: string,
  ): Product {
    const updatedProduct = existingProduct.archiveVariant(variantId);
    return updatedProduct;
  }

  /**
   * Maps a variant ID to call restoreVariant on Product entity
   * @param existingProduct The existing product
   * @param variantId The ID of the variant to restore
   * @returns The product with the variant restored
   */
  static fromRestoreVariantDto(
    existingProduct: Product,
    variantId: string,
  ): Product {
    const updatedProduct = existingProduct.restoreVariant(variantId);
    return updatedProduct;
  }

  /**
   * Maps a variant ID to call removeVariant on Product entity
   * @param existingProduct The existing product
   * @param variantId The ID of the variant to remove
   * @returns The product with the variant removed
   */
  static fromRemoveVariantDto(
    existingProduct: Product,
    variantId: string,
  ): Product {
    const updatedProduct = existingProduct.removeVariant(variantId);
    return updatedProduct;
  }
}
