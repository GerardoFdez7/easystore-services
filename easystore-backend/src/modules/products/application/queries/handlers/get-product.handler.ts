import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetProductQuery } from '@modules/products/application/queries/get-product.query';
import { RedisCacheAdapter } from '@infrastructure/cache/adapters/redis-cache.adapter';
import { ProductRepository } from '@infrastructure/repositories/product.repository';
import { ProductDto } from '@modules/products/interfaces/graphql/dto/product.dto';
import { Logger } from '@nestjs/common';

@QueryHandler(GetProductQuery)
export class GetProductHandler implements IQueryHandler<GetProductQuery> {
  private readonly productCacheTtl = 3600;
  private readonly logger = new Logger(GetProductHandler.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cacheAdapter: RedisCacheAdapter,
  ) {}

  async execute(query: GetProductQuery): Promise<ProductDto> {
    const { id, clientId } = query;
    const cacheKey = `product:${clientId}:${id}`;

    try {
      const cachedProduct = await this.cacheAdapter.get<ProductDto>(cacheKey);
      if (cachedProduct) {
        this.logger.debug(`Cache hit for product ${id}`);
        return cachedProduct;
      }

      this.logger.debug(`Cache miss for product ${id}, fetching from database`);

      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.cacheAdapter.set(cacheKey, product, this.productCacheTtl);

      const productDto: ProductDto = {
        id: product.productId.toString(),
        name: product.name,
        stock: product.stock,
        description: (product as { description?: string }).description || '',
        price: product.price || 0,
        sku: product.sku || '',
        categoryId: '',
        createdAt: undefined,
        updatedAt: undefined,
      };

      return productDto;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error fetching product ${id}: ${errorMessage}`,
        errorStack,
      );
      throw new Error(`Error fetching product: ${errorMessage}`);
    }
  }
}
