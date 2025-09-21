import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
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
    const { variantIds } = query;
    if (!variantIds || variantIds.length === 0) {
      return [];
    }

    const idsVO = variantIds.map((id) => Id.create(id));

    const variants = await this.productRepository.findVariantsByIds(idsVO);

    if (!variants || variants.length === 0) {
      throw new NotFoundException('No variants found for the provided IDs');
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
