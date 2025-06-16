import {
  ID,
  Int,
  Resolver,
  Mutation,
  Args,
  Query,
  registerEnumType,
} from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CategoryType,
  PaginatedCategoriesType,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './types';
import {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  DeleteCategoryDTO,
} from '../../application/commands';
import {
  GetCategoryByIdDTO,
  GetAllCategoriesDTO,
} from '../../application/queries';
import { PaginatedCategoriesDTO } from '../../application/mappers';
import { SortBy, SortOrder } from '../../aggregates/value-objects';

registerEnumType(SortBy, {
  name: 'SortBy',
});

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

@Resolver()
export default class CategoryResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => CategoryType)
  async createCategory(
    @Args('input', { type: () => CreateCategoryInput })
    input: CreateCategoryInput,
  ): Promise<CategoryType> {
    return this.commandBus.execute(new CreateCategoryDTO(input));
  }

  @Mutation(() => CategoryType)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @Args('input', { type: () => UpdateCategoryInput })
    input: UpdateCategoryInput,
  ): Promise<CategoryType> {
    return this.commandBus.execute(new UpdateCategoryDTO(id, tenantId, input));
  }

  @Mutation(() => CategoryType)
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('tenantId', { type: () => ID }) tenantId: string,
  ): Promise<CategoryType> {
    return this.commandBus.execute(new DeleteCategoryDTO(id, tenantId));
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => CategoryType)
  async getCategoryById(
    @Args('id', { type: () => ID }) id: string,
    @Args('tenantId', { type: () => ID }) tenantId: string,
  ): Promise<CategoryType> {
    return this.queryBus.execute(new GetCategoryByIdDTO(id, tenantId));
  }

  @Query(() => PaginatedCategoriesType)
  async getAllCategories(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @Args('page', { defaultValue: 1, nullable: true, type: () => Int })
    page?: number,
    @Args('limit', { defaultValue: 25, nullable: true, type: () => Int })
    limit?: number,
    @Args('name', { nullable: true, type: () => String }) name?: string,
    @Args('parentId', { nullable: true, type: () => ID })
    parentId?: string,
    @Args('includeSubcategories', { defaultValue: true, nullable: true })
    includeSubcategories?: boolean,
    @Args('sortBy', { nullable: true, type: () => SortBy }) sortBy?: SortBy,
    @Args('sortOrder', { nullable: true, type: () => SortOrder })
    sortOrder?: SortOrder,
  ): Promise<PaginatedCategoriesDTO> {
    return this.queryBus.execute(
      new GetAllCategoriesDTO(tenantId, {
        page,
        limit,
        name,
        parentId,
        includeSubcategories,
        sortBy,
        sortOrder,
      }),
    );
  }
}
