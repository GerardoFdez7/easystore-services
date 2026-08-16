import { NotFoundException } from '@nestjs/common';
import { Product } from '../../aggregates/entities';
import { IProductRepository } from '../../aggregates/repositories/product.interface';
import { Id } from '../../aggregates/value-objects';

export async function findProductOrThrow(
  repository: IProductRepository,
  tenantId: string,
  productId: string,
  displayedId = productId,
): Promise<Product> {
  const product = await repository.findById(
    Id.create(tenantId),
    Id.create(productId),
  );

  if (!product) {
    throw new NotFoundException(`Product with ID ${displayedId} not found`);
  }

  return product;
}
