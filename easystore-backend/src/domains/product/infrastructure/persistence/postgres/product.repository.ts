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
import {
  Id,
  Name,
  Type,
  SortBy,
  SortOrder,
} from '../../../aggregates/value-objects';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PostgreService) {}

  private async manageAttributes(
    tx: Prisma.TransactionClient,
    variantId: number,
    attributesData: Array<{ key: string; value: string; id?: number }> = [],
    existingAttributes: PrismaAttribute[] = [],
  ): Promise<void> {
    const dtoAttributeIds = attributesData
      .map((a) => a.id)
      .filter((id) => id !== undefined && id !== null);
    const existingAttributeIds = existingAttributes.map((a) => a.id);

    const attributesToDelete = existingAttributeIds.filter(
      (id) => !dtoAttributeIds.includes(id),
    );
    if (attributesToDelete.length > 0) {
      await tx.attribute.deleteMany({
        where: { id: { in: attributesToDelete }, variantId },
      });
    }

    for (const attrData of attributesData) {
      const data = { key: attrData.key, value: attrData.value, variantId };
      if (attrData.id && existingAttributeIds.includes(attrData.id)) {
        await tx.attribute.update({ where: { id: attrData.id }, data });
      } else {
        const createData = {
          key: attrData.key,
          value: attrData.value,
          variantId,
        };
        await tx.attribute.create({ data: createData });
      }
    }
  }

  private async manageDimension(
    tx: Prisma.TransactionClient,
    variantId: number,
    dimensionData?: {
      height: number;
      width: number;
      length: number;
      id?: number;
    } | null,
    existingDimension?: PrismaDimension | null,
  ): Promise<void> {
    if (!dimensionData) {
      if (existingDimension) {
        await tx.dimension.delete({
          where: { id: existingDimension.id, variantId },
        });
      }
      return;
    }

    const data = { ...dimensionData, variantId };
    if (existingDimension) {
      await tx.dimension.update({ where: { id: existingDimension.id }, data });
    } else {
      await tx.dimension.create({ data });
    }
  }

  private async manageWarranties(
    tx: Prisma.TransactionClient,
    variantId: number,
    warrantyDtos: WarrantyDTO[] = [],
    existingWarranties: PrismaWarranty[] = [],
  ): Promise<void> {
    const dtoWarrantyIds = warrantyDtos
      .map((w) => w.id)
      .filter((id) => id !== undefined && id !== null);
    const existingWarrantyIds = existingWarranties.map((w) => w.id);

    const warrantiesToDelete = existingWarrantyIds.filter(
      (id) => !dtoWarrantyIds.includes(id),
    );
    if (warrantiesToDelete.length > 0) {
      await tx.warranty.deleteMany({
        where: { id: { in: warrantiesToDelete }, variantId },
      });
    }

    for (const warrantyDto of warrantyDtos) {
      const data = { ...warrantyDto, variantId };
      if (warrantyDto.id && existingWarrantyIds.includes(warrantyDto.id)) {
        await tx.warranty.update({ where: { id: warrantyDto.id }, data });
      } else {
        await tx.warranty.create({ data });
      }
    }
  }

  private async manageInstallmentPayments(
    tx: Prisma.TransactionClient,
    variantId: number,
    paymentDtos: InstallmentPaymentDTO[] = [],
    existingPayments: PrismaInstallmentPayment[] = [],
  ): Promise<void> {
    const dtoPaymentIds = paymentDtos
      .map((p) => p.id)
      .filter((id) => id !== undefined && id !== null);
    const existingPaymentIds = existingPayments.map((p) => p.id);

    const paymentsToDelete = existingPaymentIds.filter(
      (id) => !dtoPaymentIds.includes(id),
    );
    if (paymentsToDelete.length > 0) {
      await tx.installmentPayment.deleteMany({
        where: { id: { in: paymentsToDelete }, variantId },
      });
    }

    for (const paymentDto of paymentDtos) {
      const data = { ...paymentDto, variantId };
      if (paymentDto.id && existingPaymentIds.includes(paymentDto.id)) {
        await tx.installmentPayment.update({
          where: { id: paymentDto.id },
          data,
        });
      } else {
        await tx.installmentPayment.create({ data });
      }
    }
  }

  private async manageMedia(
    tx: Prisma.TransactionClient,
    entityId: number, // productId or variantId
    entityType: 'product' | 'variant',
    mediaDtos: MediaDTO[] = [],
    existingMedia: PrismaMedia[] = [],
  ): Promise<void> {
    const dtoMediaIds = mediaDtos
      .map((m) => m.id)
      .filter((id) => id !== undefined && id !== null);
    const existingMediaIds = existingMedia.map((m) => m.id);

    const mediaToDelete = existingMediaIds.filter(
      (id) => !dtoMediaIds.includes(id),
    );
    if (mediaToDelete.length > 0) {
      const deleteWhere: Prisma.MediaWhereInput = { id: { in: mediaToDelete } };
      if (entityType === 'product') deleteWhere.productId = entityId;
      else deleteWhere.variantId = entityId;
      await tx.media.deleteMany({ where: deleteWhere });
    }

    for (const mediaDto of mediaDtos) {
      const data: Prisma.MediaUncheckedCreateInput = {
        url: mediaDto.url,
        position: mediaDto.position,
        mediaType: mediaDto.mediaType,
      };
      if (entityType === 'product') data.productId = entityId;
      else data.variantId = entityId;

      if (mediaDto.id && existingMediaIds.includes(mediaDto.id)) {
        await tx.media.update({ where: { id: mediaDto.id }, data });
      } else {
        await tx.media.create({ data });
      }
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

      await this.manageAttributes(
        tx,
        currentVariant.id,
        variantDto.attributes,
        currentVariant.attributes,
      );
      await this.manageDimension(
        tx,
        currentVariant.id,
        variantDto.dimension,
        currentVariant.dimension,
      );
      await this.manageMedia(
        tx,
        currentVariant.id,
        'variant',
        variantDto.variantMedia,
        currentVariant.variantMedia,
      );
      await this.manageWarranties(
        tx,
        currentVariant.id,
        variantDto.warranties,
        currentVariant.warranties,
      );
      await this.manageInstallmentPayments(
        tx,
        currentVariant.id,
        variantDto.installmentPayments,
        currentVariant.installmentPayments,
      );
    }
  }

  private async manageCategories(
    tx: Prisma.TransactionClient,
    productId: number,
    categoryDtos: ProductCategoriesDTO[] = [],
  ): Promise<void> {
    // Delete all existing and create new ones
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
    sustainabilityDtos: SustainabilityDTO[] = [],
    existingSustainabilities: PrismaSustainability[] = [],
  ): Promise<void> {
    const dtoSustainabilityIds = sustainabilityDtos
      .map((s) => s.id)
      .filter((id) => id !== undefined && id !== null);
    const existingSustainabilityIds = existingSustainabilities.map((s) => s.id);

    const sustainabilitiesToDelete = existingSustainabilityIds.filter(
      (id) => !dtoSustainabilityIds.includes(id),
    );
    if (sustainabilitiesToDelete.length > 0) {
      await tx.sustainability.deleteMany({
        where: { id: { in: sustainabilitiesToDelete }, productId },
      });
    }

    for (const susDto of sustainabilityDtos) {
      const data = { ...susDto, productId };
      delete data.id;
      if (susDto.id && existingSustainabilityIds.includes(susDto.id)) {
        await tx.sustainability.update({
          where: { id: susDto.id },
          data: data as Prisma.SustainabilityUpdateInput,
        });
      } else {
        await tx.sustainability.create({
          data: data as unknown as Prisma.SustainabilityCreateInput,
        });
      }
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
              metadata: productDto.metadata as Prisma.InputJsonValue,
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
            currentProductWithRelations.media,
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
            currentProductWithRelations.sustainabilities,
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
              metadata: productDto.metadata as Prisma.InputJsonValue,
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

  // Soft delete a product by its ID
  async softDelete(tenantId: Id, id: Id): Promise<void> {
    const tenantIdValue = tenantId.getValue();
    const idValue = id.getValue();
    try {
      const now = new Date();
      const scheduledForHardDeleteAt = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      );
      const metadata = {
        deleted: true,
        deletedAt: now,
        scheduledForHardDeleteAt,
      };
      await this.prisma.product.update({
        where: {
          tenantId: tenantIdValue,
          id: idValue,
        },
        data: {
          metadata,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ResourceNotFoundError('Product', idValue.toString());
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        'soft delete product',
        errorMessage,
        error instanceof Error ? error : new Error(errorMessage),
      );
    }
  }

  // Hard delete a product by its ID (permanent deletion)
  async hardDelete(id: Id): Promise<void> {
    const idValue = id.getValue();
    try {
      await this.prisma.product.delete({
        where: {
          id: idValue,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ResourceNotFoundError('Product', idValue.toString());
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

  // Restore a soft-deleted product
  async restore(tenantId: Id, id: Id): Promise<void> {
    const tenantIdValue = tenantId.getValue();
    const idValue = id.getValue();
    try {
      const productToCheck = await this.prisma.product.findUnique({
        where: { tenantId: tenantIdValue, id: idValue },
        select: { metadata: true },
      });

      if (!productToCheck) {
        throw new ResourceNotFoundError('Product', idValue.toString());
      }

      if (
        !(productToCheck.metadata as { deleted: boolean }).deleted === false
      ) {
        throw new DatabaseOperationError(
          'restore product',
          `Product ${idValue} is not soft-deleted and cannot be restored.`,
        );
      }

      await this.prisma.product.update({
        where: {
          tenantId: tenantIdValue,
          id: idValue,
        },
        data: {
          metadata: {
            deleted: false,
            deletedAt: null,
            scheduledForHardDeleteAt: null,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof ResourceNotFoundError ||
        error instanceof DatabaseOperationError
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ResourceNotFoundError(
            'Product',
            idValue.toString() + ' not found',
          );
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new DatabaseOperationError(
        'restore product',
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

      if (
        !prismaProduct ||
        (prismaProduct.metadata as { deleted?: boolean })?.deleted === true
      ) {
        return null;
      }
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
    name: Name,
    tenantId: Id,
    page?: number,
    limit?: number,
    includeSoftDeleted?: boolean,
  ): Promise<{ products: Product[]; total: number }> {
    const whereConditions: Prisma.ProductWhereInput[] = [
      { tenantId: tenantId.getValue() },
      { name: { contains: name.getValue(), mode: 'insensitive' } },
    ];

    if (includeSoftDeleted === false || includeSoftDeleted === undefined) {
      whereConditions.push({
        metadata: {
          path: ['deleted'],
          equals: false,
        },
      });
    } else if (includeSoftDeleted === true) {
      whereConditions.push({
        metadata: {
          path: ['deleted'],
          equals: true,
        },
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
        metadata: {
          path: ['deleted'],
          equals: false,
        },
      });
    } else if (includeSoftDeleted === true) {
      conditions.push({
        metadata: {
          path: ['deleted'],
          equals: true,
        },
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
