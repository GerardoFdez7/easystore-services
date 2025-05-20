import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { PaginatedProductsDTO } from '../../mappers/product.dto';
import { ProductMapper } from '../../mappers/product.mapper';
import { GetAllProductsDTO } from './all-products.dto';

@QueryHandler(GetAllProductsDTO)
export class GetAllProductsHandler implements IQueryHandler<GetAllProductsDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetAllProductsDTO): Promise<PaginatedProductsDTO> {
    const { page, limit, includeSoftDeleted } = query;

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    // Find all products with pagination and optional filtering
    const result = await this.productRepository.findAll(
      page,
      limit,
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
