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
  VariantType,
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
  GetProductsByNameDTO,
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
    @Args('id') id: number,
    @Args('tenantId') tenantId: number,
  ): Promise<ProductType> {
    return this.commandBus.execute(new SoftDeleteProductDTO(id, tenantId));
  }

  @Mutation(() => ProductType)
  async hardDeleteProduct(
    @Args('id') id: number,
    @Args('tenantId') tenantId: number,
  ): Promise<ProductType> {
    return this.commandBus.execute(new HardDeleteProductDTO(id, tenantId));
  }

  @Mutation(() => ProductType)
  async restoreProduct(
    @Args('id') id: number,
    @Args('tenantId') tenantId: number,
  ): Promise<ProductType> {
    return this.commandBus.execute(new RestoreProductDTO(id, tenantId));
  }

  // Variants mutations
  @Mutation(() => VariantType)
  async addVariant(
    @Args('input') input: CreateVariantInput,
  ): Promise<VariantType> {
    return this.commandBus.execute(new CreateVariantDTO(input));
  }

  @Mutation(() => VariantType)
  async updateVariant(
    @Args('id') id: number,
    @Args('productId') productId: number,
    @Args('tenantId') tenantId: number,
    @Args('input') input: UpdateVariantInput,
  ): Promise<VariantType> {
    return this.commandBus.execute(
      new UpdateVariantDTO(id, productId, tenantId, { ...input }),
    );
  }

  @Mutation(() => VariantType)
  async archiveVariant(
    @Args('id') id: number,
    @Args('productId') productId: number,
    @Args('tenantId') tenantId: number,
  ): Promise<VariantType> {
    return this.commandBus.execute(
      new ArchiveVariantDTO(id, productId, tenantId),
    );
  }

  @Mutation(() => VariantType)
  async restoreVariant(
    @Args('id') id: number,
    @Args('productId') productId: number,
    @Args('tenantId') tenantId: number,
  ): Promise<VariantType> {
    return this.commandBus.execute(
      new RestoreVariantDTO(id, productId, tenantId),
    );
  }

  @Mutation(() => VariantType)
  async removeVariant(
    @Args('id') id: number,
    @Args('productId') productId: number,
    @Args('tenantId') tenantId: number,
  ): Promise<VariantType> {
    return this.commandBus.execute(
      new DeleteVariantDTO(id, productId, tenantId),
    );
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => ProductType)
  async getProductById(
    @Args('id') id: number,
    @Args('tenantId') tenantId: number,
  ): Promise<ProductType> {
    return this.queryBus.execute(new GetProductByIdDTO(id, tenantId));
  }

  @Query(() => PaginatedProductsType)
  async getProductsByName(
    @Args('name') name: string,
    @Args('tenantId') tenantId: number,
    @Args('page', { defaultValue: 1 }) page: number,
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('includeSoftDeleted', { defaultValue: false, nullable: true })
    includeSoftDeleted: boolean,
  ): Promise<PaginatedProductsDTO> {
    return this.queryBus.execute(
      new GetProductsByNameDTO(name, tenantId, page, limit, includeSoftDeleted),
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
    @Args('includeSoftDeleted', { defaultValue: false, nullable: true })
    includeSoftDeleted: boolean,
  ): Promise<PaginatedProductsDTO> {
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
