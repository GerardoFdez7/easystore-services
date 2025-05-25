import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Name, Id } from '../../../aggregates/value-objects';
import { ProductMapper, ProductDTO } from '../../mappers';
import { GetProductsByNameDTO } from './name.dto';

@QueryHandler(GetProductsByNameDTO)
export class GetProductsByNameHandler
  implements IQueryHandler<GetProductsByNameDTO>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductsByNameDTO): Promise<ProductDTO[]> {
    const { name, tenantId, includeSoftDeleted } = query;

    // Create value objects
    const productName = Name.create(name);
    const tenantIdValue = Id.create(tenantId);

    // Find products by name
    const products = await this.productRepository.findByName(
      productName,
      tenantIdValue,
      includeSoftDeleted,
    );

    if (!products || products.length === 0) {
      throw new NotFoundException(
        `Products with name containing "${name}" not found`,
      );
    }

    return products.map(
      (product) => ProductMapper.toDto(product) as ProductDTO,
    );
  }
}
