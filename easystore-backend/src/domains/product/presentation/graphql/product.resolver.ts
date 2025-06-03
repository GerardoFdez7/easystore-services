import {
  Int,
  Resolver,
  Mutation,
  Args,
  Query,
  registerEnumType,
} from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ProductType,
  PaginatedProductsType,
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
} from './types';
import {
  CreateProductDTO,
  CreateVariantDTO,
  RestoreProductDTO,
  UpdateProductDTO,
  UpdateVariantDTO,
  SoftDeleteProductDTO,
  HardDeleteProductDTO,
  DeleteVariantDTO,
} from '../../application/commands';
import {
  GetProductByIdDTO,
  GetProductsByNameDTO,
  GetAllProductsDTO,
} from '../../application/queries';
import { SortBy, SortOrder, TypeEnum } from '../../aggregates/value-objects';

registerEnumType(TypeEnum, {
  name: 'TypeEnum',
});

registerEnumType(SortBy, {
  name: 'SortBy',
});

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

@Resolver(() => ProductType)
export class ProductResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  ///////////////
  // Mutations //
  ///////////////

  @Mutation(() => ProductType)
  async createProduct(
    @Args('input') input: CreateProductInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(new CreateProductDTO({ ...input }));
  }

  @Mutation(() => ProductType)
  async updateProduct(
    @Args('id') id: number,
    @Args('tenantId') tenantId: number,
    @Args('input') input: UpdateProductInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new UpdateProductDTO(id, tenantId, { ...input }),
    );
  }

  @Mutation(() => ProductType)
  async softDeleteProduct(
    @Args('tenantId') tenantId: number,
    @Args('id') id: number,
  ): Promise<ProductType> {
    return this.commandBus.execute(new SoftDeleteProductDTO(tenantId, id));
  }

  @Mutation(() => ProductType)
  async hardDeleteProduct(
    @Args('tenantId') tenantId: number,
    @Args('id') id: number,
  ): Promise<ProductType> {
    return this.commandBus.execute(new HardDeleteProductDTO(tenantId, id));
  }

  @Mutation(() => ProductType)
  async restoreProduct(
    @Args('tenantId') tenantId: number,
    @Args('id') id: number,
  ): Promise<ProductType> {
    return this.commandBus.execute(new RestoreProductDTO(tenantId, id));
  }

  // Variants mutations
  @Mutation(() => ProductType)
  async addVariant(
    @Args('input') input: CreateVariantInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(new CreateVariantDTO(input));
  }

  @Mutation(() => ProductType)
  async updateVariant(
    @Args('id') id: number,
    @Args('productId') productId: number,
    @Args('tenantId') tenantId: number,
    @Args('input') input: UpdateVariantInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new UpdateVariantDTO(id, productId, tenantId, { ...input }),
    );
  }

  @Mutation(() => ProductType)
  async deleteVariant(
    @Args('id') id: number,
    @Args('productId') productId: number,
    @Args('tenantId') tenantId: number,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new DeleteVariantDTO(id, productId, tenantId),
    );
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => ProductType)
  async getProductById(
    @Args('tenantId') tenantId: number,
    @Args('id') id: number,
  ): Promise<ProductType> {
    return this.queryBus.execute(new GetProductByIdDTO(tenantId, id));
  }

  @Query(() => [ProductType])
  async getProductsByName(
    @Args('name') name: string,
    @Args('tenantId') tenantId: number,
    @Args('includeSoftDeleted', { nullable: true }) includeSoftDeleted: boolean,
  ): Promise<ProductType[]> {
    return this.queryBus.execute(
      new GetProductsByNameDTO(name, tenantId, includeSoftDeleted),
    );
  }

  @Query(() => PaginatedProductsType)
  async getAllProducts(
    @Args('tenantId') tenantId: number,
    @Args('page', { defaultValue: 1 }) page: number,
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('categoriesIds', { nullable: true, type: () => [Int] })
    categoriesIds: number[],
    @Args('type', { nullable: true, type: () => TypeEnum }) type: TypeEnum,
    @Args('sortBy', { nullable: true, type: () => SortBy }) sortBy: SortBy,
    @Args('sortOrder', { nullable: true, type: () => SortOrder })
    sortOrder: SortOrder,
    @Args('includeSoftDeleted', { nullable: true }) includeSoftDeleted: boolean,
  ): Promise<{ products: ProductType[]; total: number }> {
    return this.queryBus.execute(
      new GetAllProductsDTO(
        tenantId,
        page,
        limit,
        categoriesIds,
        type,
        sortBy,
        sortOrder,
        includeSoftDeleted,
      ),
    );
  }
}
