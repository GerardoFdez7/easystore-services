import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ProductDto } from '@modules/products/interfaces/graphql/dto/product.dto';
import { ProductUpdateData } from '@modules/products/application/commands/update-product.command';
import { LoggerService } from '@logging/winston/winston.service';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  clientId: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findById(productId: string | number): Promise<{
    description: string;
    categoryId: string;
    price: number;
    sku: string;
    productId: number;
    name: string;
    stock: number;
  }> {
    return Promise.resolve({
      productId:
        typeof productId === 'string' ? parseInt(productId, 10) : productId,
      name: 'Sample Product',
      description: 'Sample description',
      stock: 0.85,
      price: 100.0,
      sku: 'SAMPLE-SKU',
      categoryId: 'default-category',
    });
  }

  async findMany(
    clientId: string,
    categoryId?: string,
    _skip: number = 0,
    _take: number = 20,
  ): Promise<ProductDto[]> {
    // TODO: Implement the logic to fetch products from the database
    return Promise.resolve(
      Array(5)
        .fill(null)
        .map((_, i) => ({
          id: `prod-${i + 1}`,
          name: `Producto ${i + 1}`,
          description: `Descripción del producto ${i + 1}`,
          price: 99.99 + i * 10,
          sku: `SKU-${i + 100}`,
          stock: 100 + i * 5,
          clientId,
          categoryId: categoryId || 'electronics',
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
    );
  }

  async update(
    id: string,
    clientId: number,
    data: ProductUpdateData,
  ): Promise<Product | null> {
    try {
      const existingProduct = await this.findById(id);
      if (!existingProduct) {
        return null;
      }

      const updatedProduct: Product = {
        id: existingProduct.productId.toString(),
        clientId,
        createdAt: new Date(),
        description: existingProduct.description || '',
        categoryId: existingProduct.categoryId || '',
        ...existingProduct,
        ...data,
        updatedAt: new Date(),
      };

      // TODO: Implement the logic to update the product in the database
      /*
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
      */

      return Promise.resolve(updatedProduct);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      const errorStack = (error as Error).stack;
      this.logger.error(
        `Error updating product ${id}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async getPopularProducts(
    clientId: number,
    limit: number = 10,
  ): Promise<{ id: string }[]> {
    try {
      return Promise.resolve(
        Array(limit)
          .fill(null)
          .map((_, i) => ({
            id: `prod-${i + 1}`,
          })),
      );

      // TODO: Implement the logic to fetch popular products from the database:
      /*
      return await this.prisma.$queryRaw`
        SELECT p.id 
        FROM products p
        JOIN order_details od ON p.id = od.product_id
        WHERE p.client_id = ${clientId}
        GROUP BY p.id
        ORDER BY COUNT(od.id) DESC
        LIMIT ${limit}
      `;
      */
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      const errorStack = (error as Error).stack;
      this.logger.error(
        `Error getting popular products: ${errorMessage}`,
        errorStack,
      );
      return [];
    }
  }

  async getActiveClients(): Promise<{ id: number }[]> {
    try {
      return Promise.resolve([{ id: 1 }, { id: 2 }]);

      // TODO: Implement the logic to fetch active clients from the database
      /*
      return await this.prisma.client.findMany({
        where: {
          subscription: {
            status: 'ACTIVE'
          }
        },
        select: { id: true }
      });
      */
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      const errorStack = (error as Error).stack;
      this.logger.error(
        `Error getting active clients: ${errorMessage}`,
        errorStack,
      );
      return [];
    }
  }
}
