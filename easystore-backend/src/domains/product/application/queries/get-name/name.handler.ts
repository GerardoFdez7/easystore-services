import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Name } from '../../../aggregates/value-objects';
import { ProductDTO } from '../../mappers/product.dto';
import { ProductMapper } from '../../mappers/product.mapper';
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
    const { name, includeSoftDeleted } = query;

    // Create Name value object
    const productName = Name.create(name);

    // Find products by name
    const products = await this.productRepository.findByName(
      productName,
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
