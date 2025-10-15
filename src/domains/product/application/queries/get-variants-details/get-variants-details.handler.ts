import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../../../aggregates/repositories/product.interface';
import { Id } from '../../../aggregates/value-objects';
import { GetVariantsDetailsDTO } from './get-variants-details.dto';
import { VariantDetailsDTO } from '@shared/dtos';

@QueryHandler(GetVariantsDetailsDTO)
export class GetVariantsDetailsHandler
  implements IQueryHandler<GetVariantsDetailsDTO, VariantDetailsDTO[]>
{
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetVariantsDetailsDTO): Promise<VariantDetailsDTO[]> {
    const { variantIds, search } = query;

    const variants = await this.productRepository.findVariantsByIds(
      variantIds?.map((id) => Id.create(id)) || [],
      search,
    );

    if (!variants || variants.length === 0) {
      return [];
    }

    return variants.map((v) => ({
      variantId: v.id,
      sku: v.sku,
      firstAttribute: v.attributes[0] || { key: '', value: '' },
      productName: v.product.name,
      isArchived: v.isArchived,
    }));
  }
}
