import { Injectable } from '@nestjs/common';
import { IProductAdapter } from '../../application/ports';
import { VariantDetailsDTO } from '@shared/dtos';
import { QueryBus } from '@nestjs/cqrs';
import { GetVariantsDetailsDTO } from '@product/application/queries';

@Injectable()
export class ProductAdapter implements IProductAdapter {
  constructor(private queryBus: QueryBus) {}

  async getVariantsDetails(
    variantIds: string[],
    search?: string,
  ): Promise<VariantDetailsDTO[]> {
    return this.queryBus.execute(new GetVariantsDetailsDTO(variantIds, search));
  }
}
