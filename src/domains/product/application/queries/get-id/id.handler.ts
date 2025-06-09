import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Id } from '../../../aggregates/value-objects';
import { ProductMapper, ProductDTO } from '../../mappers';
import { GetProductByIdDTO } from './id.dto';

@QueryHandler(GetProductByIdDTO)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdDTO> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
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

    return {
      ...ProductMapper.toDto(product),
    } as ProductDTO;
  }
}
