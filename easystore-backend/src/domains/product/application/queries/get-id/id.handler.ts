import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Id } from '../../../aggregates/value-objects';
import { ProductDTO } from '../../mappers/product.dto';
import { ProductMapper } from '../../mappers/product.mapper';
import { GetProductByIdDTO } from './id.dto';

export class GetProductByIdQuery {
  constructor(public readonly dto: GetProductByIdDTO) {}
}

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler
  implements IQueryHandler<GetProductByIdQuery>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductByIdQuery): Promise<ProductDTO> {
    const { id, includeSoftDeleted } = query.dto;

    // Create ID value object
    const productId = Id.create(id);

    // Find the product by ID
    const product = await this.productRepository.findById(
      productId,
      includeSoftDeleted,
    );
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      ...ProductMapper.toDto(product),
    } as ProductDTO;
  }
}
