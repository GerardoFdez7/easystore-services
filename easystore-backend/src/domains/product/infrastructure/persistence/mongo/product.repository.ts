import { Injectable } from '@nestjs/common';
import { Product as PrismaProduct, Prisma } from '.prisma/mongodb';
import { MongoService } from '@infrastructure/database/mongo/mongo.service';
import { Product } from '../../../aggregates/entities/product.entity';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { ProductMapper } from '../../../application/mappers/product.mapper';
import { Id, Name, CategoryId } from '../../../aggregates/value-objects';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: MongoService) {}

  // Save (create or update) a product
  async save(product: Product): Promise<Product> {
    const id = product.get('id')?.getValue?.();
    const data: Prisma.ProductCreateInput = product.toDTO();
    let prismaProduct: PrismaProduct;

    if (id) {
      prismaProduct = await this.prisma.product.update({
        where: { id },
        data,
      });
    } else {
      prismaProduct = await this.prisma.product.create({
        data,
      });
    }
    return this.mapToDomain(prismaProduct);
  }

  // Soft delete a product by its ID
  async softDelete(id: Id): Promise<void> {
    const product: PrismaProduct | null = await this.prisma.product.findUnique({
      where: { id: id.getValue() },
    });
    if (!product) return;
    const now = new Date();
    const scheduledForHardDeleteAt = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    ); // 30 days from now
    const metadata = {
      ...product.metadata,
      deleted: true,
      deletedAt: now,
      scheduledForHardDeleteAt,
    };
    await this.prisma.product.update({
      where: { id: id.getValue() },
      data: {
        metadata,
      },
    });
  }

  // Hard delete a product by its ID (permanent deletion)
  async hardDelete(id: Id): Promise<void> {
    await this.prisma.product.delete({
      where: { id: id.getValue() },
    });
  }

  // Restore a soft-deleted product
  async restore(id: Id): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: id.getValue() },
    });
    if (!product) return;
    await this.prisma.product.update({
      where: { id: id.getValue() },
      data: {
        metadata: {
          ...product.metadata,
          deleted: false,
          deletedAt: null,
        },
      },
    });
  }

  // Find a product by its ID
  async findById(id: Id, includeSoftDeleted = false): Promise<Product | null> {
    const prismaProduct = await this.prisma.product.findUnique({
      where: { id: id.getValue() },
    });
    if (!prismaProduct) return null;
    if (!includeSoftDeleted && prismaProduct.metadata?.deleted) return null;
    return this.mapToDomain(prismaProduct);
  }

  // Find products by name (partial match)
  async findByName(name: Name, includeSoftDeleted = false): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        name: { contains: name.getValue(), mode: 'insensitive' },
        ...(includeSoftDeleted ? {} : { 'metadata.deleted': false }),
      },
    });
    return products.map((product) => this.mapToDomain(product));
  }

  // Find all products with pagination, including option to include soft-deleted items
  async findAll(
    page: number,
    limit: number,
    categoryId?: CategoryId,
    includeSoftDeleted = false,
  ): Promise<{ products: Product[]; total: number }> {
    const where: unknown = {
      ...(categoryId ? { categoryId: { has: categoryId.getValue() } } : {}),
      ...(includeSoftDeleted ? {} : { 'metadata.deleted': false }),
    };
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return {
      products: products.map((product) => this.mapToDomain(product)),
      total,
    };
  }

  // Map from database model to domain entity using the centralized mapping approach
  private mapToDomain(clientPrisma: PrismaProduct): Product {
    return ProductMapper.fromPersistence(clientPrisma);
  }
}
