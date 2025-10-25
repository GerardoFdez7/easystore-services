import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Id, Type, ProductFilterMode } from '../../../aggregates/value-objects';
import { ProductMapper, PaginatedProductsDTO } from '../../mappers';
import { GetAllProductsDTO } from './all-products.dto';
import { ICategoryAdapter } from '../../ports/category.port';

@QueryHandler(GetAllProductsDTO)
export class GetAllProductsHandler implements IQueryHandler<GetAllProductsDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ICategoryAdapter')
    private readonly categoryAdapter: ICategoryAdapter,
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
      filterMode,
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

    if (limit && limit > 50) {
      throw new BadRequestException(
        'Limit must be less than or equal to 50 if provided',
      );
    }

    // Create value objects
    const tenantIdVO = Id.create(tenantId);
    const categoriesIdsVO = categoriesIds
      ? categoriesIds.map((categoryId) => Id.create(categoryId))
      : undefined;
    const typeVO = type ? Type.create(type) : undefined;
    const filterModeVO = filterMode
      ? ProductFilterMode.create(filterMode)
      : undefined;

    // Find all products with pagination and optional filtering
    const result = await this.productRepository.findAll(tenantIdVO, {
      page,
      limit,
      name,
      categoriesIds: categoriesIdsVO,
      type: typeVO,
      sortBy,
      sortOrder,
      filterMode: filterModeVO,
    });

    if (!result || result.total === 0) {
      throw new NotFoundException(`No products found`);
    }

    const productsDto = ProductMapper.toDtoArray(result.products);

    // Always enrich with category information
    const allCategoryIds = new Set<string>();
    productsDto.forEach((product) => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach((cat) => allCategoryIds.add(cat.categoryId));
      }
    });

    // Create paginated DTO
    const paginatedDto = {
      products: productsDto,
      total: result.total,
      hasMore: result.hasMore,
    };

    if (allCategoryIds.size > 0) {
      const categories = await this.categoryAdapter.getCategories(
        tenantIdVO,
        Array.from(allCategoryIds),
      );

      // Create a map for quick lookup using the id field from CategoryDTO
      const categoryMap = new Map(
        categories.map((cat) => [cat.categoryId, cat]),
      );

      // Enrich products with category information using the mapper
      return ProductMapper.enrichPaginatedWithCategories(
        paginatedDto,
        categoryMap,
      );
    }

    // Return enriched products even with empty category map for consistency
    return ProductMapper.enrichPaginatedWithCategories(paginatedDto, new Map());
  }
}
