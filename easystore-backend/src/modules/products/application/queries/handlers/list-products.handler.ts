import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RedisCacheAdapter } from '@cache/adapters/redis-cache.adapter';
import { ProductRepository } from '@repositories/product.repository';
import { ListProductsQuery } from '../list-products.query';
import { ProductDto } from '../../../interfaces/graphql/dto/product.dto';

@QueryHandler(ListProductsQuery)
export class ListProductsHandler implements IQueryHandler<ListProductsQuery> {
  private readonly listCacheTtl = 1800;
  private readonly logger = new Logger(ListProductsHandler.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cacheAdapter: RedisCacheAdapter,
  ) {}

  async execute(query: ListProductsQuery): Promise<ProductDto[]> {
    const { clientId, categoryId, skip, take } = query;

    const cacheKey = `products:${clientId}:${categoryId || 'all'}:${skip || 0}:${take || 20}`;

    try {
      const cachedProducts =
        await this.cacheAdapter.get<ProductDto[]>(cacheKey);
      if (cachedProducts) {
        this.logger.debug(`Cache hit for products list with key ${cacheKey}`);
        return cachedProducts;
      }

      this.logger.debug(`Cache miss for products list, fetching from database`);

      const products = await this.productRepository.findMany(
        clientId.toString(),
        categoryId,
        skip,
        take,
      );

      // 3. Guardar en caché
      await this.cacheAdapter.set(cacheKey, products, this.listCacheTtl);

      return products;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Error listing products: ${errorMessage}`, errorStack);
      throw new Error(`Error listing products: ${errorMessage}`);
    }
  }
}
