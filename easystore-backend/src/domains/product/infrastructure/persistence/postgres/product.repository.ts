import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import {
  Product as PrismaProduct,
  Variant as PrismaVariant,
  Media as PrismaMedia,
  ProductCategories as PrismaProductCategory,
  Sustainability as PrismaSustainability,
  Attribute as PrismaAttribute,
  Dimension as PrismaDimension,
  Warranty as PrismaWarranty,
  InstallmentPayment as PrismaInstallmentPayment,
  Prisma,
} from '.prisma/postgres';
import {
  ResourceNotFoundError,
  UniqueConstraintViolationError,
  ForeignKeyConstraintViolationError,
  DatabaseOperationError,
} from '@domains/errors';
import { Product, IProductType } from '../../../aggregates/entities';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import {
  ProductMapper,
  ProductDTO,
  VariantDTO,
  MediaDTO,
  ProductCategoriesDTO,
  SustainabilityDTO,
  WarrantyDTO,
  InstallmentPaymentDTO,
} from '../../../application/mappers';
import { Id, Type, SortBy, SortOrder } from '../../../aggregates/value-objects';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PostgreService) {}

  private async manageAttributes(
    tx: Prisma.TransactionClient,
    variantId: number,
    attributesData: Array<{ key: string; value: string }> = [],
  ): Promise<void> {
    await tx.attribute.deleteMany({
      where: { variantId },
    });

    // Create new attributes from the DTO
    if (attributesData.length > 0) {
      const createData = attributesData.map((attr) => ({
        key: attr.key,
        value: attr.value,
        variantId,
      }));
      await tx.attribute.createMany({ data: createData });
    }
  }

  private async manageDimension(
    tx: Prisma.TransactionClient,
    variantId: number,
    dimensionData?: {
      height: number;
      width: number;
      length: number;
    } | null,
  ): Promise<void> {
    await tx.dimension.deleteMany({
      where: { variantId },
    });

    // Create a new dimension if data is provided
    if (dimensionData) {
      await tx.dimension.create({
        data: { ...dimensionData, variantId },
      });
    }
  }

  private async manageWarranties(
    tx: Prisma.TransactionClient,
    variantId: number,
    warrantyDtos: Omit<WarrantyDTO, 'id' | 'variantId'>[] = [],
  ): Promise<void> {
    await tx.warranty.deleteMany({
      where: { variantId },
    });

    // Create new warranties from the DTOs
    if (warrantyDtos.length > 0) {
      const createData = warrantyDtos.map((warrantyDto) => ({
        ...warrantyDto,
        variantId,
      }));
      await tx.warranty.createMany({ data: createData });
    }
  }

  private async manageInstallmentPayments(
    tx: Prisma.TransactionClient,
    variantId: number,
    paymentDtos: Omit<InstallmentPaymentDTO, 'id' | 'variantId'>[] = [],
  ): Promise<void> {
    await tx.installmentPayment.deleteMany({
      where: { variantId },
    });

    // Create new installment payments from the DTOs
    if (paymentDtos.length > 0) {
      const createData = paymentDtos.map((paymentDto) => ({
        ...paymentDto,
        variantId,
      }));
      await tx.installmentPayment.createMany({ data: createData });
    }
  }

  private async manageMedia(
    tx: Prisma.TransactionClient,
    entityId: number, // productId or variantId
    entityType: 'product' | 'variant',
    mediaDtos: Omit<MediaDTO, 'id' | 'productId' | 'variantId'>[] = [],
  ): Promise<void> {
    const deleteWhere: Prisma.MediaWhereInput = {};
    if (entityType === 'product') deleteWhere.productId = entityId;
    else deleteWhere.variantId = entityId;

    await tx.media.deleteMany({ where: deleteWhere });

    // Create new media from the DTOs
    if (mediaDtos.length > 0) {
      const createData = mediaDtos.map((mediaDto) => {
        const data: Prisma.MediaUncheckedCreateInput = {
          url: mediaDto.url,
          position: mediaDto.position,
          mediaType: mediaDto.mediaType,
        };
        if (entityType === 'product') data.productId = entityId;
        else data.variantId = entityId;
        return data;
      });
      await tx.media.createMany({ data: createData });
    }
  }

  private async manageVariants(
    tx: Prisma.TransactionClient,
    productId: number,
    tenantId: number,
    variantDtos: VariantDTO[] = [],
    existingVariantsFull: (PrismaVariant & {
      attributes?: PrismaAttribute[];
      dimension?: PrismaDimension | null;
      variantMedia?: PrismaMedia[];
      warranties?: PrismaWarranty[];
      installmentPayments?: PrismaInstallmentPayment[];
    })[] = [],
  ): Promise<void> {
    const dtoVariantIds = variantDtos
      .map((v) => v.id)
      .filter((id) => id !== undefined && id !== null);
    const existingVariantIds = existingVariantsFull.map((v) => v.id);

    const variantsToDelete = existingVariantIds.filter(
      (id) => !dtoVariantIds.includes(id),
    );
    if (variantsToDelete.length > 0) {
      await tx.variant.deleteMany({
        where: { id: { in: variantsToDelete }, productId },
      });
    }

    for (const variantDto of variantDtos) {
      const variantData = {
        price: variantDto.price,
        variantCover: variantDto.variantCover,
        personalizationOptions: variantDto.personalizationOptions || [],
        weight: variantDto.weight,
        condition: variantDto.condition,
        upc: variantDto.upc,
        ean: variantDto.ean,
        isbn: variantDto.isbn,
        barcode: variantDto.barcode,
        sku: variantDto.sku,
        isArchived: variantDto.isArchived,
        productId,
        tenantId,
      };

      let currentVariant: PrismaVariant & {
        attributes?: PrismaAttribute[];
        dimension?: PrismaDimension | null;
        variantMedia?: PrismaMedia[];
        warranties?: PrismaWarranty[];
        installmentPayments?: PrismaInstallmentPayment[];
      };

      if (variantDto.id && existingVariantIds.includes(variantDto.id)) {
        currentVariant = await tx.variant.update({
          where: { id: variantDto.id },
          data: variantData,
          include: {
            attributes: true,
            dimension: true,
            variantMedia: true,
            warranties: true,
            installmentPayments: true,
          },
        });
      } else {
        currentVariant = await tx.variant.create({
          data: variantData,
          include: {
            attributes: true,
            dimension: true,
            variantMedia: true,
            warranties: true,
            installmentPayments: true,
          },
        });
      }

      await this.manageAttributes(tx, currentVariant.id, variantDto.attributes);
      await this.manageDimension(tx, currentVariant.id, variantDto.dimension);
      await this.manageMedia(
        tx,
        currentVariant.id,
        'variant',
        variantDto.variantMedia,
      );
      await this.manageWarranties(tx, currentVariant.id, variantDto.warranties);
      await this.manageInstallmentPayments(
        tx,
        currentVariant.id,
        variantDto.installmentPayments,
      );
    }
  }

  private async manageCategories(
    tx: Prisma.TransactionClient,
    productId: number,
    categoryDtos: ProductCategoriesDTO[] = [],
  ): Promise<void> {
    await tx.productCategories.deleteMany({ where: { productId } });
    if (categoryDtos.length > 0) {
      await tx.productCategories.createMany({
        data: categoryDtos.map((cat) => ({
          productId,
          categoryId: cat.categoryId,
        })),
      });
    }
  }

  private async manageSustainabilities(
    tx: Prisma.TransactionClient,
    productId: number,
    sustainabilityDtos: Omit<SustainabilityDTO, 'id' | 'productId'>[] = [],
  ): Promise<void> {
    await tx.sustainability.deleteMany({
      where: { productId },
    });

    // Create new sustainabilities from the DTOs
    if (sustainabilityDtos.length > 0) {
      const createData = sustainabilityDtos.map((susDto) => ({
        ...susDto,
        productId,
      }));
      await tx.sustainability.createMany({ data: createData });
    }
  }

  async save(product: Product): Promise<Product> {
    const id = product.get('id')?.getValue?.();
    const productDto = ProductMapper.toDto(product) as ProductDTO;

    try {
      const prismaProduct = await this.prisma.$transaction(async (tx) => {
        let currentProductWithRelations: PrismaProduct & {
          media?: PrismaMedia[];
          variants?: (PrismaVariant & {
            attributes?: PrismaAttribute[];
            dimension?: PrismaDimension | null;
            variantMedia?: PrismaMedia[];
            warranties?: PrismaWarranty[];
            installmentPayments?: PrismaInstallmentPayment[];
          })[];
          categories?: PrismaProductCategory[];
          sustainabilities?: PrismaSustainability[];
        };

        if (id) {
          // Fetch existing product with all relations for update comparison
          const existingProduct = await tx.product.findUnique({
            where: { id },
            include: {
              media: true,
              variants: {
                include: {
                  attributes: true,
                  dimension: true,
                  variantMedia: true,
                  warranties: true,
                  installmentPayments: true,
                },
              },
              categories: true,
              sustainabilities: true,
            },
          });
          if (!existingProduct)
            throw new ResourceNotFoundError('Product', id.toString());
          currentProductWithRelations = existingProduct;

          // Update product base fields
          currentProductWithRelations = await tx.product.update({
            where: { id },
            data: {
              name: productDto.name,
              shortDescription: productDto.shortDescription,
              longDescription: productDto.longDescription,
              productType: productDto.productType,
              cover: productDto.cover,
              tags: productDto.tags,
              brand: productDto.brand,
              manufacturer: productDto.manufacturer,
              isArchived: productDto.isArchived,
            },
            include: {
              // Re-include relations after update
              media: true,
              variants: {
                include: {
                  attributes: true,
                  dimension: true,
                  variantMedia: true,
                  warranties: true,
                  installmentPayments: true,
                },
              },
              categories: true,
              sustainabilities: true,
            },
          });

          await this.manageMedia(
            tx,
            currentProductWithRelations.id,
            'product',
            productDto.media,
          );
          await this.manageVariants(
            tx,
            currentProductWithRelations.id,
            currentProductWithRelations.tenantId,
            productDto.variants,
            currentProductWithRelations.variants,
          );
          await this.manageCategories(
            tx,
            currentProductWithRelations.id,
            productDto.categories,
          );
          await this.manageSustainabilities(
            tx,
            currentProductWithRelations.id,
            productDto.sustainabilities,
          );
        } else {
          // Create new product
          currentProductWithRelations = await tx.product.create({
            data: {
              name: productDto.name,
              shortDescription: productDto.shortDescription,
              longDescription: productDto.longDescription,
              productType: productDto.productType,
              cover: productDto.cover,
              tags: productDto.tags,
              brand: productDto.brand,
              manufacturer: productDto.manufacturer,
              isArchived: productDto.isArchived,
              tenant: { connect: { id: productDto.tenantId } },
            },
          });

          const newProductId = currentProductWithRelations.id;
          const tenantId = productDto.tenantId;

          await this.manageMedia(tx, newProductId, 'product', productDto.media);
          await this.manageVariants(
            tx,
            newProductId,
            tenantId,
            productDto.variants,
          );
          await this.manageCategories(tx, newProductId, productDto.categories);
          await this.manageSustainabilities(
            tx,
            newProductId,
            productDto.sustainabilities,
          );
        }

        // Re-fetch the product with all its relations after all operations
        return tx.product.findUniqueOrThrow({
          where: { id: currentProductWithRelations.id },
          include: {
            media: true,
            variants: {
              include: {
                attributes: true,
                dimension: true,
                variantMedia: true,
                warranties: true,
                installmentPayments: true,
              },
            },
            categories: true,
            sustainabilities: true,
          },
        });
      });
      return this.mapToDomain(prismaProduct);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          const field = target ? target.join(', ') : 'unknown field';
          throw new UniqueConstraintViolationError(field);
        }
        if (error.code === 'P2003') {
          const rawFieldName = error.meta?.field_name as string | undefined;
          let field = rawFieldName || 'unknown field';
          let relatedEntity = 'related entity';
          if (rawFieldName?.toLowerCase().includes('tenantid')) {
            field = 'tenantId';
            relatedEntity = 'Tenant';
          }
          throw new ForeignKeyConstraintViolationError(field, relatedEntity);
        }
        if (error.code === 'P2025' && id) {
          throw new ResourceNotFoundError('Product', id.toString());
        }
      }
      const operation = id ? 'update product' : 'create product';
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        operation,
        errorMessage,
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }

  async hardDelete(tenantId: Id, id: Id): Promise<Product> {
    const tenantIdValue = tenantId.getValue();
    const idValue = id.getValue();
    try {
      const prismaProduct = await this.prisma.product.delete({
        where: {
          tenantId: tenantIdValue,
          id: idValue,
        },
      });
      return this.mapToDomain(prismaProduct);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ResourceNotFoundError('Product', idValue.toString());
        } else if (error.code === 'P2003') {
          throw new ForeignKeyConstraintViolationError(
            'Product belongs to',
            'Order or Return',
          );
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        'hard delete product',
        errorMessage,
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }

  // Find a product by its ID
  async findById(tenantId: Id, id: Id): Promise<Product | null> {
    const tenantIdValue = tenantId.getValue();
    const idValue = id.getValue();
    try {
      const prismaProduct = await this.prisma.product.findUnique({
        where: {
          tenantId: tenantIdValue,
          id: idValue,
        },
        include: {
          media: true,
          variants: {
            include: {
              attributes: true,
              dimension: true,
              variantMedia: true,
              warranties: true,
              installmentPayments: true,
            },
          },
          categories: true,
          sustainabilities: true,
        },
      });
      return this.mapToDomain(prismaProduct);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        `find product by id ${idValue}`,
        errorMessage,
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }

  // Find products by name (partial match)
  async findByName(
    name: string,
    tenantId: Id,
    page?: number,
    limit?: number,
    includeSoftDeleted?: boolean,
  ): Promise<{ products: Product[]; total: number }> {
    const whereConditions: Prisma.ProductWhereInput[] = [
      { tenantId: tenantId.getValue() },
      { name: { contains: name, mode: 'insensitive' } },
    ];

    if (includeSoftDeleted === false || includeSoftDeleted === undefined) {
      whereConditions.push({
        isArchived: false,
      });
    } else if (includeSoftDeleted === true) {
      whereConditions.push({
        isArchived: true,
      });
    }

    try {
      const skip = page && limit ? (page - 1) * limit : undefined;
      const take = limit;

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: { AND: whereConditions },
          include: {
            media: true,
            variants: true,
            categories: true,
            sustainabilities: true,
          },
          skip,
          take,
        }),
        this.prisma.product.count({
          where: { AND: whereConditions },
        }),
      ]);

      return {
        products: products.map((product) => this.mapToDomain(product)),
        total,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        'find products by name',
        errorMessage,
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }

  // Find all products with pagination and optional filtering
  async findAll(
    tenantId: Id,
    page: number,
    limit: number,
    categoriesIds?: Id[],
    type?: Type,
    sortBy?: SortBy,
    sortOrder?: SortOrder,
    includeSoftDeleted?: boolean,
  ): Promise<{ products: Product[]; total: number }> {
    const conditions: Prisma.ProductWhereInput[] = [
      { tenantId: tenantId.getValue() },
    ];

    if (categoriesIds && categoriesIds.length > 0) {
      conditions.push({
        categories: {
          some: {
            categoryId: {
              in: categoriesIds.map((id) => id.getValue()),
            },
          },
        },
      });
    }

    if (type) {
      conditions.push({ productType: type.getValue() });
    }

    if (includeSoftDeleted === false || includeSoftDeleted === undefined) {
      conditions.push({
        isArchived: false,
      });
    } else if (includeSoftDeleted === true) {
      conditions.push({
        isArchived: true,
      });
    }

    const whereClause: Prisma.ProductWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] =
        sortOrder || (sortBy === SortBy.NAME ? SortOrder.ASC : SortOrder.DESC);
    } else {
      orderBy.createdAt = SortOrder.DESC;
    }

    try {
      const skip = page && limit ? (page - 1) * limit : undefined;
      const take = limit;

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: whereClause,
          skip,
          take,
          orderBy,
          include: {
            media: true,
            variants: true,
            categories: true,
            sustainabilities: true,
          },
        }),
        this.prisma.product.count({ where: whereClause }),
      ]);
      return {
        products: products.map((product) => this.mapToDomain(product)),
        total,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        'find all products',
        errorMessage,
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }

  // Map from database product to domain product using the centralized mapping approach
  private mapToDomain(prismaProduct: PrismaProduct): Product {
    return ProductMapper.fromPersistence(
      prismaProduct as unknown as IProductType,
    );
  }
}
