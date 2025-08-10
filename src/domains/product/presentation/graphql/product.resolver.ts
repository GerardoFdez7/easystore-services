import {
  Int,
  Resolver,
  Mutation,
  Args,
  Query,
  registerEnumType,
} from '@nestjs/graphql';
import { CurrentUser } from '@authentication/infrastructure/decorators';
import { JwtPayload } from '@authentication/infrastructure/jwt';
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
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    const inputWithTenantId = { ...input, tenantId: user.tenantId };
    return this.commandBus.execute(new CreateProductDTO(inputWithTenantId));
  }

  @Mutation(() => ProductType)
  async updateProduct(
    @Args('id') id: string,
    @Args('input') input: UpdateProductInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new UpdateProductDTO(id, user.tenantId, { ...input }),
    );
  }

  @Mutation(() => ProductType)
  async softDeleteProduct(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(new SoftDeleteProductDTO(id, user.tenantId));
  }

  @Mutation(() => ProductType)
  async hardDeleteProduct(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(new HardDeleteProductDTO(id, user.tenantId));
  }

  @Mutation(() => ProductType)
  async restoreProduct(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(new RestoreProductDTO(id, user.tenantId));
  }

  // Variants mutations
  @Mutation(() => ProductType)
  async addVariant(
    @Args('input') input: CreateVariantInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    const inputWithTenantId = { ...input, tenantId: user.tenantId };
    return this.commandBus.execute(new CreateVariantDTO(inputWithTenantId));
  }

  @Mutation(() => ProductType)
  async updateVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @Args('input') input: UpdateVariantInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new UpdateVariantDTO(id, productId, user.tenantId, { ...input }),
    );
  }

  @Mutation(() => ProductType)
  async archiveVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new ArchiveVariantDTO(id, productId, user.tenantId),
    );
  }

  @Mutation(() => ProductType)
  async restoreVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new RestoreVariantDTO(id, productId, user.tenantId),
    );
  }

  @Mutation(() => ProductType)
  async removeVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new DeleteVariantDTO(id, productId, user.tenantId),
    );
  }

  ///////////////
  //  Queries  //
  ///////////////

  @Query(() => ProductType)
  async getProductById(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.queryBus.execute(new GetProductByIdDTO(id, user.tenantId));
  }

  @Query(() => PaginatedProductsType)
  async getAllProducts(
    @CurrentUser() user: JwtPayload,
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
      new GetAllProductsDTO(user.tenantId, {
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
