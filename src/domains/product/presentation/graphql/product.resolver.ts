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
  ArchiveVariantDTO,
  RestoreVariantDTO,
} from '../../application/commands';
import {
  GetProductByIdDTO,
  GetAllProductsDTO,
} from '../../application/queries';
import { PaginatedProductsDTO } from '../../application/mappers';
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
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateProductInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new UpdateProductDTO(id, tenantId, { ...input }),
    );
  }

  @Mutation(() => ProductType)
  async softDeleteProduct(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<ProductType> {
    return this.commandBus.execute(new SoftDeleteProductDTO(id, tenantId));
  }

  @Mutation(() => ProductType)
  async hardDeleteProduct(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<ProductType> {
    return this.commandBus.execute(new HardDeleteProductDTO(id, tenantId));
  }

  @Mutation(() => ProductType)
  async restoreProduct(
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<ProductType> {
    return this.commandBus.execute(new RestoreProductDTO(id, tenantId));
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
    @Args('id') id: string,
    @Args('productId') productId: string,
    @Args('tenantId') tenantId: string,
    @Args('input') input: UpdateVariantInput,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new UpdateVariantDTO(id, productId, tenantId, { ...input }),
    );
  }

  @Mutation(() => ProductType)
  async archiveVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @Args('tenantId') tenantId: string,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new ArchiveVariantDTO(id, productId, tenantId),
    );
  }

  @Mutation(() => ProductType)
  async restoreVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @Args('tenantId') tenantId: string,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new RestoreVariantDTO(id, productId, tenantId),
    );
  }

  @Mutation(() => ProductType)
  async removeVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @Args('tenantId') tenantId: string,
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
    @Args('id') id: string,
    @Args('tenantId') tenantId: string,
  ): Promise<ProductType> {
    return this.queryBus.execute(new GetProductByIdDTO(id, tenantId));
  }

  @Query(() => PaginatedProductsType)
  async getAllProducts(
    @Args('tenantId') tenantId: string,
    @Args('page', { defaultValue: 1, nullable: true }) page?: number,
    @Args('limit', { defaultValue: 25, nullable: true }) limit?: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('categoriesIds', { nullable: true, type: () => [Int] })
    categoriesIds?: string[],
    @Args('type', { nullable: true, type: () => TypeEnum }) type?: TypeEnum,
    @Args('sortBy', { nullable: true, type: () => SortBy }) sortBy?: SortBy,
    @Args('sortOrder', { nullable: true, type: () => SortOrder })
    sortOrder?: SortOrder,
    @Args('includeSoftDeleted', { defaultValue: false, nullable: true })
    includeSoftDeleted?: boolean,
  ): Promise<PaginatedProductsDTO> {
    return this.queryBus.execute(
      new GetAllProductsDTO(tenantId, {
        page,
        limit,
        name,
        categoriesIds,
        type,
        sortBy,
        sortOrder,
        includeSoftDeleted,
      }),
    );
  }
}
