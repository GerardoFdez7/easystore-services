import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Id, Type } from '../../../aggregates/value-objects';
import { ProductMapper, PaginatedProductsDTO } from '../../mappers';
import { GetAllProductsDTO } from './all-products.dto';

@QueryHandler(GetAllProductsDTO)
export class GetAllProductsHandler implements IQueryHandler<GetAllProductsDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetAllProductsDTO): Promise<PaginatedProductsDTO> {
    const { tenantId, options } = query;
    const {
      page,
      limit,
      name,
      categoriesIds,
      type,
      sortBy,
      sortOrder,
      includeSoftDeleted,
    } = options || {};

    // Validate pagination parameters
    if (page !== undefined && page < 1) {
      throw new BadRequestException(
        'Page must be a positive number if provided',
      );
    }
    if (limit !== undefined && limit < 1) {
      throw new BadRequestException(
        'Limit must be a positive number if provided',
      );
    }

    // Create value objects
    const tenantIdVO = Id.create(tenantId);
    const categoriesIdsVO = categoriesIds
      ? categoriesIds.map((categoryId) => Id.create(categoryId))
      : undefined;
    const typeVO = type ? Type.create(type) : undefined;

    // Find all products with pagination and optional filtering
    const result = await this.productRepository.findAll(tenantIdVO, {
      page,
      limit,
      name,
      categoriesIds: categoriesIdsVO,
      type: typeVO,
      sortBy,
      sortOrder,
      includeSoftDeleted,
    });

    if (!result || result.total === 0) {
      throw new NotFoundException(`No products found`);
    }

    return {
      products: ProductMapper.toDtoArray(result.products),
      total: result.total,
      hasMore: result.hasMore,
    };
  }
}
