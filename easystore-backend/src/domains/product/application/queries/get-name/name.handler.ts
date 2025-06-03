import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Name, Id } from '../../../aggregates/value-objects';
import { ProductMapper, PaginatedProductsDTO } from '../../mappers';
import { GetProductsByNameDTO } from './name.dto';

@QueryHandler(GetProductsByNameDTO)
export class GetProductsByNameHandler
  implements IQueryHandler<GetProductsByNameDTO>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductsByNameDTO): Promise<PaginatedProductsDTO> {
    const { name, tenantId, page, limit, includeSoftDeleted } = query;

    // Create value objects
    const productName = Name.create(name);
    const tenantIdValue = Id.create(tenantId);

    // Find products by name
    const { products, total } = await this.productRepository.findByName(
      productName,
      tenantIdValue,
      page,
      limit,
      includeSoftDeleted,
    );

    if (!products || total === 0) {
      throw new NotFoundException(
        `Products with name containing "${name}" not found`,
      );
    }

    return {
      products: ProductMapper.toDtoArray(products),
      total,
    };
  }
}
