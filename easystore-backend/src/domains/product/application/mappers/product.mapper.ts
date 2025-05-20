import { Entity } from '@domains/entity.base';
import {
  Product,
  ProductProps,
  IProductType,
  IProductBase,
} from '../../aggregates/entities';
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
} from '../../aggregates/value-objects';
import { ProductDTO, PaginatedProductsDTO } from './product.dto';
import { UpdateProductDTO } from '../commands/update/product/update-product.dto';

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
      shortDescription: ShortDescription.create(model.shortDescription),
      longDescription: model.longDescription
        ? LongDescription.create(model.longDescription)
        : null,
      type: Type.create(model.type),
      cover: Cover.create(model.cover),
      tags: model.tags.map((tag) => Tags.create([tag])),
      brand: model.brand ? Brand.create(model.brand) : null,
      manufacturer: model.manufacturer
        ? Manufacturer.create(model.manufacturer)
        : null,
      metadata: model.metadata ? Metadata.create(model.metadata) : null,
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
        shortDescription: entity.get('shortDescription').getValue(),
        longDescription: entity.get('longDescription')?.getValue(),
        type: entity.get('type').getValue(),
        cover: entity.get('cover').getValue(),
        tags: entity
          .get('tags')
          .map((tag) => tag.getValue())
          .flat(),
        brand: entity.get('brand')?.getValue(),
        manufacturer: entity.get('manufacturer')?.getValue(),
        metadata: entity.get('metadata')
          ? {
              deleted: entity.get('metadata').getDeleted(),
              deletedAt: entity.get('metadata').getDeletedAt(),
              scheduledForHardDeleteAt: entity
                .get('metadata')
                .getScheduledForHardDeleteAt(),
            }
          : null,
        tenantId: entity.get('id').getValue(),
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
        case 'shortDescription':
          dto.shortDescription = product.get('shortDescription').getValue();
          break;
        case 'longDescription':
          dto.longDescription = product.get('longDescription')?.getValue();
          break;
        case 'type':
          dto.type = product.get('type').getValue();
          break;
        case 'cover':
          dto.cover = product.get('cover').getValue();
          break;
        case 'tags':
          dto.tags = product.get('tags').map((tag) => tag.getValue()[0]);
          break;
        case 'brand':
          dto.brand = product.get('brand')?.getValue();
          break;
        case 'manufacturer':
          dto.manufacturer = product.get('manufacturer')?.getValue();
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
