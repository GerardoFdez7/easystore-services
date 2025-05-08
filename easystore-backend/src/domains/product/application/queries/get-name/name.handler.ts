import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Name } from '../../../aggregates/value-objects';
import { ProductDTO } from '../../mappers/product.dto';
import { ProductMapper } from '../../mappers/product.mapper';
import { GetProductsByNameDTO } from './name.dto';

export class GetProductsByNameQuery {
  constructor(public readonly dto: GetProductsByNameDTO) {}
}

@QueryHandler(GetProductsByNameQuery)
export class GetProductsByNameHandler
  implements IQueryHandler<GetProductsByNameQuery>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductsByNameQuery): Promise<ProductDTO[]> {
    const { name, includeSoftDeleted } = query.dto;

    // Create Name value object
    const productName = Name.create(name);

    // Find products by name
    const products = await this.productRepository.findByName(
      productName,
      includeSoftDeleted,
    );
    if (!products) {
      throw new NotFoundException(`Products with names ${name} not found`);
    }

    return products.map(
      (product) => ProductMapper.toDto(product) as ProductDTO,
    );
  }
}
