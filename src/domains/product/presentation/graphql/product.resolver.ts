import {
  ID,
  Resolver,
  Mutation,
  Args,
  Query,
  registerEnumType,
} from '@nestjs/graphql';
import { optionalArg, pageArg } from '@shared/presentation/graphql/';
import { CurrentUser, JwtPayload } from '@shared/presentation/decorators';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ProductType,
  PaginatedProductsType,
  CreateProductInput,
  UpdateProductInput,
} from './types';
import {
  CreateProductDTO,
  RestoreProductDTO,
  UpdateProductDTO,
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
import {
  SortBy,
  SortOrder,
  TypeEnum,
  ProductFilterModeEnum,
} from '../../aggregates/value-objects';

registerEnumType(TypeEnum, {
  name: 'TypeEnum',
});

registerEnumType(SortBy, {
  name: 'ProductSortBy',
});

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

registerEnumType(ProductFilterModeEnum, {
  name: 'ProductFilterMode',
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
    @Args('page', pageArg(1)) page?: number,
    @Args('limit', pageArg(25)) limit?: number,
    @Args('name', optionalArg(() => String)) name?: string,
    @Args('categoriesIds', optionalArg(() => [ID]))
    categoriesIds?: string[],
    @Args('type', optionalArg(() => TypeEnum)) type?: TypeEnum,
    @Args('sortBy', optionalArg(() => SortBy)) sortBy?: SortBy,
    @Args('sortOrder', optionalArg(() => SortOrder))
    sortOrder?: SortOrder,
    @Args('filterMode', {
      defaultValue: ProductFilterModeEnum.ALL,
      nullable: true,
      type: () => ProductFilterModeEnum,
    })
    filterMode?: ProductFilterModeEnum,
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
        filterMode,
      }),
    );
  }
}
