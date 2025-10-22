import { Injectable } from '@nestjs/common';
import { PostgreService } from '@database/postgres.service';
import { PrismaErrorUtils } from '@utils/prisma-error-utils';
import {
  Product as PrismaProduct,
  Variant as PrismaVariant,
  Media as PrismaMedia,
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
} from '@shared/errors';
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
    variantId: string,
    attributesData: Array<{ id?: string; key: string; value: string }> = [],
  ): Promise<void> {
    await tx.attribute.deleteMany({
      where: { variantId },
    });

    // Create new attributes from the DTO
    if (attributesData.length > 0) {
      const createData = attributesData.map((attr) => ({
        id: attr.id,
        key: attr.key,
        value: attr.value,
        variantId,
      }));
      await tx.attribute.createMany({ data: createData });
    }
  }

  private async manageDimension(
    tx: Prisma.TransactionClient,
    variantId: string,
    dimensionData?: {
      id?: string;
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
      const { id, ...dimensionFields } = dimensionData;
      await tx.dimension.create({
        data: {
          id: id || '',
          ...dimensionFields,
          variantId,
        },
      });
    }
  }

  private async manageWarranties(
    tx: Prisma.TransactionClient,
    variantId: string,
    warrantyDtos: Omit<WarrantyDTO, 'variantId'>[] = [],
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
    variantId: string,
    paymentDtos: Omit<InstallmentPaymentDTO, 'variantId'>[] = [],
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
    entityId: string, // productId or variantId
    entityType: 'product' | 'variant',
    mediaDtos: Omit<MediaDTO, 'productId' | 'variantId'>[] = [],
  ): Promise<void> {
    const deleteWhere: Prisma.MediaWhereInput = {};
    if (entityType === 'product') deleteWhere.productId = entityId;
    else deleteWhere.variantId = entityId;

    await tx.media.deleteMany({ where: deleteWhere });

    // Create new media from the DTOs
    if (mediaDtos.length > 0) {
      const createData = mediaDtos.map((mediaDto) => {
        const data: Prisma.MediaUncheckedCreateInput = {
          id: mediaDto.id,
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
    productId: string,
    tenantId: string,
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
        id: variantDto.id,
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
    productId: string,
    categoryDtos: ProductCategoriesDTO[] = [],
  ): Promise<void> {
    await tx.productCategories.deleteMany({ where: { productId } });
    if (categoryDtos.length > 0) {
      await tx.productCategories.createMany({
        data: categoryDtos.map((cat) => ({
          id: cat.id,
          productId,
          categoryId: cat.categoryId,
        })),
      });
    }
  }

  private async manageSustainabilities(
    tx: Prisma.TransactionClient,
    productId: string,
    sustainabilityDtos: Omit<SustainabilityDTO, 'productId'>[] = [],
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

  /**
   * Creates a new product with transaction support and proper error handling
   */
  async create(product: Product): Promise<Product> {
    const productDto = ProductMapper.toDto(product) as ProductDTO;

    try {
      const prismaProduct = await this.prisma.$transaction(async (tx) => {
        // Create new product
        const currentProductWithRelations = await tx.product.create({
          data: {
            id: productDto.id,
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

        // Handle related entities
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

        // Return the created product with all relations
        return tx.product.findUniqueOrThrow({
          where: { id: newProductId },
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
            categories: {
              include: {
                category: true,
              },
            },
            sustainabilities: true,
          },
        });
      });

      return this.mapToDomain(prismaProduct);
    } catch (error) {
      return this.handleDatabaseError(error, 'create product');
    }
  }

  /**
   * Updates an existing product with transaction support
   */
  async update(tenantId: Id, id: Id, updates: Product): Promise<Product> {
    const idValue = id.getValue();
    const tenantIdValue = tenantId.getValue();
    const updatesDto = ProductMapper.toDto(updates) as ProductDTO;

    try {
      const prismaProduct = await this.prisma.$transaction(async (tx) => {
        // Get existing product with all relations
        const existingProduct = await tx.product.findUnique({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
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
            categories: {
              include: {
                category: true,
              },
            },
            sustainabilities: true,
          },
        });

        if (!existingProduct) {
          throw new ResourceNotFoundError('Product', idValue);
        }

        // Update the main product
        await tx.product.update({
          where: {
            id: idValue,
            tenantId: tenantIdValue,
          },
          data: {
            name: updatesDto.name,
            shortDescription: updatesDto.shortDescription,
            longDescription: updatesDto.longDescription,
            productType: updatesDto.productType,
            cover: updatesDto.cover,
            tags: updatesDto.tags,
            brand: updatesDto.brand,
            manufacturer: updatesDto.manufacturer,
            isArchived: updatesDto.isArchived,
          },
        });

        // Handle related entities updates
        await this.manageMedia(tx, idValue, 'product', updatesDto.media);
        await this.manageVariants(
          tx,
          idValue,
          tenantIdValue,
          updatesDto.variants,
          existingProduct.variants,
        );
        await this.manageCategories(tx, idValue, updatesDto.categories);
        await this.manageSustainabilities(
          tx,
          idValue,
          updatesDto.sustainabilities,
        );

        // Return updated product with all relations
        return tx.product.findUniqueOrThrow({
          where: { id: idValue },
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
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }
      return this.handleDatabaseError(error, 'update product');
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
          categories: {
            include: {
              category: true,
            },
          },
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

  // Find all products with pagination and optional filtering
  async findAll(
    tenantId: Id,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      categoriesIds?: Id[];
      type?: Type;
      sortBy?: SortBy;
      sortOrder?: SortOrder;
      includeSoftDeleted?: boolean;
    },
  ): Promise<{ products: Product[]; total: number; hasMore: boolean }> {
    const {
      page = 1,
      limit = 25,
      name,
      categoriesIds,
      type,
      sortBy,
      sortOrder,
      includeSoftDeleted = false,
    } = options || {};

    const conditions: Prisma.ProductWhereInput[] = [
      { tenantId: tenantId.getValue() },
    ];

    if (name) {
      // Get variant IDs where the search term matches the key OR value of the first attribute (ordered by key) with prisma parameter binding to prevent SQL injection
      const variantIdsWithFirstAttributeMatch = await this.prisma.$queryRaw<
        Array<{ id: string }>
      >`
        SELECT DISTINCT v.id
        FROM "product"."Variant" v
        INNER JOIN "product"."Attribute" a ON v.id = a."variantId"
        WHERE (a.value ILIKE ${'%' + name + '%'} OR a.key ILIKE ${'%' + name + '%'})
        AND a.key = (
          SELECT a2.key
          FROM "product"."Attribute" a2
          WHERE a2."variantId" = v.id
          ORDER BY a2.key ASC
          LIMIT 1
        )
      `;

      conditions.push({
        OR: [
          {
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
          {
            variants: {
              some: {
                sku: {
                  contains: name,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            variants: {
              some: {
                id: {
                  in: variantIdsWithFirstAttributeMatch.map(
                    (result) => result.id,
                  ),
                },
              },
            },
          },
        ],
      });
    }

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

    if (!includeSoftDeleted) {
      conditions.push({
        isArchived: false,
      });
    }

    const whereClause: Prisma.ProductWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

    // Handle complex sorting that requires custom logic
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    let requiresCustomSorting = false;

    if (sortBy) {
      switch (sortBy) {
        case SortBy.VARIANT_COUNT:
        case SortBy.FIRST_VARIANT_PRICE:
        case SortBy.SKU:
          requiresCustomSorting = true;
          break;
        default:
          orderBy[sortBy] =
            sortOrder ||
            (sortBy === SortBy.NAME ? SortOrder.ASC : SortOrder.DESC);
          break;
      }
    } else {
      orderBy.createdAt = SortOrder.DESC;
    }

    try {
      const skip = (page - 1) * limit;
      const take = limit;

      let products: PrismaProduct[];
      let total: number;

      if (requiresCustomSorting) {
        // For complex sorting, we need to fetch all products first, then sort in memory
        const [allProducts, totalCount] = await Promise.all([
          this.prisma.product.findMany({
            where: whereClause,
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
                orderBy: {
                  sku: 'asc', // For consistent first variant selection
                },
              },
              categories: {
                include: {
                  category: true,
                },
              },
              sustainabilities: true,
            },
          }),
          this.prisma.product.count({ where: whereClause }),
        ]);

        // Apply custom sorting
        const sortedProducts = allProducts.sort((a, b) => {
          let comparison = 0;

          switch (sortBy) {
            case SortBy.VARIANT_COUNT: {
              comparison = a.variants.length - b.variants.length;
              break;
            }
            case SortBy.FIRST_VARIANT_PRICE: {
              const aPrice =
                a.variants.length > 0 ? Number(a.variants[0].price) : 0;
              const bPrice =
                b.variants.length > 0 ? Number(b.variants[0].price) : 0;
              comparison = aPrice - bPrice;
              break;
            }
            case SortBy.SKU: {
              const aSku = a.variants.length > 0 ? a.variants[0].sku : '';
              const bSku = b.variants.length > 0 ? b.variants[0].sku : '';
              comparison = aSku.localeCompare(bSku);
              break;
            }
          }

          // Apply sort order
          const finalOrder = sortOrder || SortOrder.DESC;
          return finalOrder === SortOrder.ASC ? comparison : -comparison;
        });

        // Apply pagination to sorted results
        products = sortedProducts.slice(skip, skip + take);
        total = totalCount;
      } else {
        // Use standard Prisma sorting for simple cases
        [products, total] = await Promise.all([
          this.prisma.product.findMany({
            where: whereClause,
            skip,
            take,
            orderBy,
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
              categories: {
                include: {
                  category: true,
                },
              },
              sustainabilities: true,
            },
          }),
          this.prisma.product.count({ where: whereClause }),
        ]);
      }

      const hasMore = skip + products.length < total;

      return {
        products: products.map((product) => this.mapToDomain(product)),
        total,
        hasMore,
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

  async findVariantsByIds(
    ids: Id[],
    search?: string,
  ): Promise<
    Array<{
      id: string;
      sku: string;
      attributes: Array<{ key: string; value: string }>;
      product: { name: string };
      isArchived: boolean;
      price: number;
    }>
  > {
    const idValues = ids.map((id) => id.getValue());

    try {
      const whereConditions: Prisma.VariantWhereInput = {};

      // If specific IDs are provided, filter by them
      if (idValues.length > 0) {
        whereConditions.id = { in: idValues };
      }

      // If search parameter is provided, add search conditions
      if (search) {
        // Get variant IDs where the search term matches the key OR value of the first attribute (ordered by key) with prisma parameter binding to prevent SQL injection
        const variantIdsWithFirstAttributeMatch = await this.prisma.$queryRaw<
          Array<{ id: string }>
        >`
          SELECT DISTINCT v.id
          FROM "product"."Variant" v
          INNER JOIN "product"."Attribute" a ON v.id = a."variantId"
          WHERE (a.value ILIKE ${'%' + search + '%'} OR a.key ILIKE ${'%' + search + '%'})
          AND a.key = (
            SELECT a2.key
            FROM "product"."Attribute" a2
            WHERE a2."variantId" = v.id
            ORDER BY a2.key ASC
            LIMIT 1
          )
        `;

        whereConditions.OR = [
          {
            sku: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            product: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            // Match variants where the search term matches the value of the first attribute (ordered by key)
            id: {
              in: variantIdsWithFirstAttributeMatch.map((result) => result.id),
            },
          },
        ];
      }

      const variants = await this.prisma.variant.findMany({
        where: whereConditions,
        include: {
          attributes: {
            orderBy: {
              key: 'asc',
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
      });

      return variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        attributes: v.attributes.map((a) => ({ key: a.key, value: a.value })),
        product: { name: v.product.name },
        isArchived: v.isArchived,
        price: +v.price,
      }));
    } catch (error) {
      return this.handleDatabaseError(error, 'find variants by ids');
    }
  }

  /**
   * Centralized error handling for database operations
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          // Unique constraint violation
          const field =
            PrismaErrorUtils.extractFieldFromUniqueConstraintError(error);
          throw new UniqueConstraintViolationError(
            field,
            `Product ${field} already exists`,
          );
        }
        case 'P2003': {
          // Foreign key constraint violation
          const field = PrismaErrorUtils.extractFieldFromForeignKeyError(error);
          const fieldToEntityMap: Record<string, string> = {
            tenantId: 'Tenant',
            categoryId: 'Category',
          };
          const relatedEntity = fieldToEntityMap[field] || 'Related Entity';
          throw new ForeignKeyConstraintViolationError(field, relatedEntity);
        }
        case 'P2025': // Record not found
          throw new ResourceNotFoundError('Product');
        default:
          break;
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new DatabaseOperationError(
      operation,
      errorMessage,
      error instanceof Error ? error : new Error(errorMessage),
    );
  }

  /**
   * Maps Prisma product to domain entity
   */
  private mapToDomain(prismaProduct: PrismaProduct): Product {
    return ProductMapper.fromPersistence(prismaProduct as IProductType);
  }
}
