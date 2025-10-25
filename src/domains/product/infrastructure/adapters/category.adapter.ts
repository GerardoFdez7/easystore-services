import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ICategoryAdapter } from '../../application/ports';
import { CategoryDTO } from '@shared/dtos';
import { GetCategoriesByIdsDTO } from '@category/application/queries';
import { Id } from '../../aggregates/value-objects';

@Injectable()
export default class CategoryAdapter implements ICategoryAdapter {
  constructor(private readonly queryBus: QueryBus) {}

  async getCategories(
    tenantId: Id,
    categoriesIds: string[],
  ): Promise<CategoryDTO[]> {
    const query = new GetCategoriesByIdsDTO(categoriesIds, tenantId.getValue());
    return this.queryBus.execute(query);
  }
}
