import { Injectable } from '@nestjs/common';
import { Product as PrismaProduct, Prisma } from '.prisma/postgres';
import { PostgreService } from '@database/postgres.service';
import {
  ResourceNotFoundError,
  UniqueConstraintViolationError,
  ForeignKeyConstraintViolationError,
  DatabaseOperationError,
} from '@domains/errors';
import { Product, IProductType } from '../../../aggregates/entities';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { ProductMapper } from '../../../application/mappers';
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

  // Save (create or update) a product
  async save(product: Product): Promise<Product> {
    const id = product.get('id')?.getValue?.();
    const productDto = ProductMapper.toDto(product);
    let prismaProduct: PrismaProduct;

    try {
      if (id) {
        prismaProduct = await this.prisma.product.update({
          where: { id },
          data: productDto as Prisma.ProductUpdateInput,
          include: {
            media: true,
            variants: true,
            categories: true,
            sustainabilities: true,
          },
        });
      } else {
        prismaProduct = await this.prisma.product.create({
          data: productDto as unknown as Prisma.ProductCreateInput,
          include: {
            media: true,
            variants: true,
            categories: true,
            sustainabilities: true,
          },
        });
      }
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
          // Add more specific inferences if Product DTO can update other direct FKs
          throw new ForeignKeyConstraintViolationError(field, relatedEntity);
        }
        if (error.code === 'P2025' && id) {
          // P2025 for update means record to update not found
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
  async hardDelete(tenantId: Id, id: Id): Promise<void> {
    const tenantIdValue = tenantId.getValue();
    const idValue = id.getValue();
    try {
      await this.prisma.product.delete({
        where: {
          tenantId: tenantIdValue,
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
          variants: true,
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
    includeSoftDeleted?: boolean,
  ): Promise<Product[]> {
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
      const products = await this.prisma.product.findMany({
        where: { AND: whereConditions },
        include: {
          media: true,
          variants: true,
          categories: true,
          sustainabilities: true,
        },
      });
      return products.map((product) => this.mapToDomain(product));
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
      orderBy[sortBy] = sortOrder || (sortBy === 'name' ? 'asc' : 'desc');
    } else {
      orderBy.createdAt = 'desc';
    }

    try {
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: whereClause,
          skip: (page - 1) * limit,
          take: limit,
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
