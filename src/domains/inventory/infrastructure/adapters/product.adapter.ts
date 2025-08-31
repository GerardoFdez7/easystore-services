import { Injectable } from '@nestjs/common';
import IProductAdapter from '../../application/ports/product.port';
import { VariantDetailsDTO } from '@domains/dtos';
import { QueryBus } from '@nestjs/cqrs';
import { GetVariantsDetailsDTO } from '@product/application/queries';

@Injectable()
export default class ProductAdapter implements IProductAdapter {
  constructor(private queryBus: QueryBus) {}

  async getVariantsDetails(variantIds: string[]): Promise<VariantDetailsDTO[]> {
    return this.queryBus.execute(new GetVariantsDetailsDTO(variantIds));
  }
}
