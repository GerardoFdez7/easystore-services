import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { CategoryId } from '../../../aggregates/value-objects';
import { ProductDTO } from '../../mappers/product.dto';
import { ProductMapper } from '../../mappers/product.mapper';
import { GetAllProductsDTO } from './all-products.dto';

export class GetAllProductsQuery {
  constructor(public readonly dto: GetAllProductsDTO) {}
}

@QueryHandler(GetAllProductsQuery)
export class GetAllProductsHandler
  implements IQueryHandler<GetAllProductsQuery>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetAllProductsQuery): Promise<{
    products: ProductDTO[];
    total: number;
  }> {
    const { page, limit, categoryId, includeSoftDeleted } = query.dto;

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    // Create CategoryId value object if categoryId is provided
    const category = categoryId ? CategoryId.create(categoryId) : undefined;

    // Find all products with pagination and optional filtering
    const result = await this.productRepository.findAll(
      page,
      limit,
      category,
      includeSoftDeleted,
    );
    if (!result) {
      throw new NotFoundException('No products found');
    }

    return {
      products: ProductMapper.toDtoArray(result.products),
      total: result.total,
    };
  }
}
