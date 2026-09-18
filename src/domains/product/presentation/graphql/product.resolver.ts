import {
  CurrentUser,
  JwtPayload,
  RequirePermission,
  AllowAccountTypes,
} from '@shared/presentation/decorators';
import {
  FeatureEnum,
  PermissionActionEnum,
  AccountTypeEnum,
} from '@shared/aggregates/value-objects';
import {
  ID,
  Resolver,
  Mutation,
  Args,
  Query,
  registerEnumType,
} from '@nestjs/graphql';
import { optionalArg, pageArg } from '@shared/presentation/graphql/';
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
import { flattenVariantPrice } from '../../application/shared/variant-input.mapper';
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

  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.CREATE)
  @Mutation(() => ProductType)
  async createProduct(
    @Args('input') input: CreateProductInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    const inputWithStoreId = {
      ...input,
      variants: input.variants?.map(flattenVariantPrice),
      storeId: user.storeId,
    };
    return this.commandBus.execute(new CreateProductDTO(inputWithStoreId));
  }

  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.EDIT)
  @Mutation(() => ProductType)
  async updateProduct(
    @Args('id') id: string,
    @Args('input') input: UpdateProductInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    const updateData = {
      ...input,
      variants: input.variants?.map(flattenVariantPrice),
    };
    return this.commandBus.execute(
      new UpdateProductDTO(id, user.storeId, updateData),
    );
  }

  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.DELETE)
  @Mutation(() => ProductType)
  async softDeleteProduct(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(new SoftDeleteProductDTO(id, user.storeId));
  }

  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.DELETE)
  @Mutation(() => ProductType)
  async hardDeleteProduct(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(new HardDeleteProductDTO(id, user.storeId));
  }

  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.EDIT)
  @Mutation(() => ProductType)
  async restoreProduct(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(new RestoreProductDTO(id, user.storeId));
  }

  // Variants mutations
  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.EDIT)
  @Mutation(() => ProductType)
  async archiveVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new ArchiveVariantDTO(id, productId, user.storeId),
    );
  }

  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.EDIT)
  @Mutation(() => ProductType)
  async restoreVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new RestoreVariantDTO(id, productId, user.storeId),
    );
  }

  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.DELETE)
  @Mutation(() => ProductType)
  async removeVariant(
    @Args('id') id: string,
    @Args('productId') productId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.commandBus.execute(
      new DeleteVariantDTO(id, productId, user.storeId),
    );
  }

  ///////////////
  //  Queries  //
  ///////////////

  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.VIEW)
  @AllowAccountTypes(
    AccountTypeEnum.TENANT,
    AccountTypeEnum.CUSTOMER,
    AccountTypeEnum.EMPLOYEE,
  )
  @Query(() => ProductType)
  async getProductById(
    @Args('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductType> {
    return this.queryBus.execute(new GetProductByIdDTO(id, user.storeId));
  }

  @RequirePermission(FeatureEnum.CATALOG, PermissionActionEnum.VIEW)
  @AllowAccountTypes(
    AccountTypeEnum.TENANT,
    AccountTypeEnum.CUSTOMER,
    AccountTypeEnum.EMPLOYEE,
  )
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
      new GetAllProductsDTO(user.storeId, {
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
