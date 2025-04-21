import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    productId: string | number,
  ): Promise<{ productId: number; name: string; stock: number }> {
    return Promise.resolve({
      productId:
        typeof productId === 'string' ? parseInt(productId, 10) : productId,
      name: 'Sample Product',
      stock: 0.85,
    });
  }
}
