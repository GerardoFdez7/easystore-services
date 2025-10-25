import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Id } from '../../../aggregates/value-objects';
import { ProductMapper, ProductDTO } from '../../mappers';
import { GetProductByIdDTO } from './id.dto';
import { ICategoryAdapter } from '../../ports/category.port';

@QueryHandler(GetProductByIdDTO)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ICategoryAdapter')
    private readonly categoryAdapter: ICategoryAdapter,
  ) {}

  async execute(query: GetProductByIdDTO): Promise<ProductDTO> {
    // Find the product by ID
    const product = await this.productRepository.findById(
      Id.create(query.tenantId),
      Id.create(query.id),
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${query.id} not found`);
    }

    const productDto = ProductMapper.toDto(product) as ProductDTO;

    // Always enrich with category information (even if empty)
    const categoryIds =
      productDto.categories?.map((cat) => cat.categoryId) || [];

    if (categoryIds.length > 0) {
      const categories = await this.categoryAdapter.getCategories(
        Id.create(query.tenantId),
        categoryIds,
      );

      // Create a map for quick lookup using the id field from CategoryDTO
      const categoryMap = new Map(
        categories.map((cat) => [cat.categoryId, cat]),
      );

      // Enrich product with category information using the mapper
      return ProductMapper.enrichWithCategories(productDto, categoryMap);
    }

    // Return enriched product even with empty category map for consistency
    return ProductMapper.enrichWithCategories(productDto, new Map());
  }
}
